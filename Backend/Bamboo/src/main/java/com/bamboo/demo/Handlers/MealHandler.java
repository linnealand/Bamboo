package com.bamboo.demo.Handlers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Array;
import java.net.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import com.bamboo.demo.Models.*;
import com.bamboo.demo.Repos.DailyInfoRepo;
import com.bamboo.demo.Repos.GoalRepo;
import com.bamboo.demo.Repos.MealRepo;
import com.bamboo.demo.Repos.UserRepo;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MealHandler {
    private MealRepo mealRepo;
    private UserRepo userRepo;
    private DailyInfoRepo dailyInfoRepo;
    private GoalRepo goalRepo;

    public MealHandler(UserRepo userRepo, DailyInfoRepo dailyInfoRepo, MealRepo mealRepo, GoalRepo goalRepo) {
        this.userRepo = userRepo;
        this.dailyInfoRepo = dailyInfoRepo;
        this.mealRepo = mealRepo;
        this.goalRepo = goalRepo;
    }

    public Meal saveMealFromLink(String link, String userId, String date) throws IOException, JSONException, IllegalAccessException {
        URL url = new URL("https://api.spoonacular.com/recipes/extract?apiKey=5ccdaac983d344338fe187bb2b7e5501&url=" + link);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-type", "application/json");
        connection.setRequestProperty("User-agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11");
        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String jsonText = in.readLine();
        JSONObject json = new JSONObject(jsonText);
        String mealName = json.get("title").toString();
        String recipeId = json.get("id").toString();

        if (recipeId.equals("-1")) {
            throw new IllegalAccessException("Meal not found");
        }

        URL nutritionURL = new URL("https://api.spoonacular.com/recipes/" + recipeId + "/nutritionWidget.json?apiKey=5ccdaac983d344338fe187bb2b7e5501");
        HttpURLConnection con = (HttpURLConnection) nutritionURL.openConnection();
        con.setRequestMethod("GET");
        con.setRequestProperty("Content-type", "application/json");

        BufferedReader input = new BufferedReader(new InputStreamReader(con.getInputStream()));
        JSONObject nutritionJson = new JSONObject(input.readLine());

        //removing last character to get number for nutrition
        String fatStr = nutritionJson.get("fat").toString();
        double fat = Double.parseDouble(fatStr.substring(0, fatStr.length() - 1));
        String proteinStr = nutritionJson.get("protein").toString();
        double protein = Double.parseDouble(proteinStr.substring(0, proteinStr.length() - 1));
        String carbStr = nutritionJson.get("carbs").toString();
        double carb = Double.parseDouble(carbStr.substring(0, carbStr.length() - 1));
        double calories = Double.parseDouble(nutritionJson.get("calories").toString());
        Meal meal = new Meal(userId, mealName, calories, fat, carb, protein);
        this.mealRepo.save(meal);

        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        Date currentDate = new Date(System.currentTimeMillis());
        //String date = formatter.format(currentDate);
        addToDate(date, meal);

        return meal;
    }


    public Meal saveMealFromName(String name, String userId,String date) throws IOException, JSONException, IllegalAccessException {
        try {
            User user = this.userRepo.findById(userId).get();
            System.out.println("the name is " + name);
            URL url = new URL("https://api.spoonacular.com/recipes/guessNutrition?apiKey=5ccdaac983d344338fe187bb2b7e5501&title=" + name);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-type", "application/json");

            BufferedReader input = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            JSONObject nutritionJson = new JSONObject(input.readLine());

            double fat = Double.parseDouble(((JSONObject) nutritionJson.get("fat")).get("value").toString());
            double protein = Double.parseDouble(((JSONObject) nutritionJson.get("protein")).get("value").toString());
            double carb = Double.parseDouble(((JSONObject) nutritionJson.get("carbs")).get("value").toString());
            double calories = Double.parseDouble(((JSONObject) nutritionJson.get("calories")).get("value").toString());

            Meal meal = new Meal(userId, name, calories, fat, carb, protein);
            this.mealRepo.save(meal);

            System.out.println("Date: HERE " + date);
            addToDate(date, meal);

            return meal;
        } catch (IOException e) {
            throw new IOException("Meal not found");
        } catch (JSONException e) {
            throw new JSONException("Meal not found");
        }
    }

    public Meal saveMealFromRecipe(String date, String userId, String recipe, String name) throws IOException {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost("https://api.spoonacular.com/recipes/parseIngredients?apiKey=5ccdaac983d344338fe187bb2b7e5501"); //enter link
        List<NameValuePair> urlParams = new ArrayList<>();
        urlParams.add(new BasicNameValuePair("includeNutrition", "true"));
        urlParams.add(new BasicNameValuePair("servings", "1"));
        urlParams.add(new BasicNameValuePair("ingredientList", recipe));
        httpPost.setEntity(new UrlEncodedFormEntity(urlParams));
        CloseableHttpResponse response = httpClient.execute(httpPost);
       // System.out.println(EntityUtils.toString(response.getEntity()));
        JSONArray jsonarray = new JSONArray(EntityUtils.toString(response.getEntity()));
        System.out.println(jsonarray);
        //for()
        //System.out.println(nutritionJson.get());

        Meal meal = new Meal();
        double fat = 0;
        double carbs = 0;
        double protein = 0;
        double calories = 0;
        for (int i = 0; i < jsonarray.length(); i++) {
            JSONObject nutrition;
            try {
                nutrition = (JSONObject) jsonarray.getJSONObject(i).get("nutrition");
            }  catch(Exception e) {
                throw new IOException("Ingredients not found");
            }
            System.out.println(nutrition);
            JSONArray nutrients = nutrition.getJSONArray("nutrients");             //nutrients array
            System.out.println(nutrients);
            for (int j = 0; j < nutrients.length(); j++) {
                String title = nutrients.getJSONObject(j).get("title").toString();      //title of nutrient
                System.out.println("title: " + title);
                double amount = (double) nutrients.getJSONObject(j).get("amount");
                System.out.println(amount);
                switch (title) {
                    case "Fat":
                        fat += amount;
                        break;
                    case "Calories":
                        calories += amount;
                        break;
                    case "Carbohydrates":
                        carbs += amount;
                        break;
                    case "Protein":
                        protein += amount;
                        break;
                }
            }
        }
        meal.setCalories(Math.round(calories * 100.0) / 100.0);
        meal.setCarbs(Math.round(carbs * 100.0) / 100.0);
        meal.setFat(Math.round(fat * 100.0) / 100.0);
        meal.setProtein(Math.round(protein * 100.0) / 100.0);
        meal.setName(name);
        meal.setUserId(userId);
        this.mealRepo.save(meal);
        addToDate(date, meal);
        return meal;
    }


    public void addToDate(String date, Meal meal) {
        String userId = meal.getUserId();
        User user = this.userRepo.findById(userId).get();
        String dailyInfoId;
        DailyInfo dailyInfo;
        System.out.println(date);
        if (!user.getDailyInfo().containsKey(date)) {
            dailyInfo = new DailyInfo(userId, date);
            this.dailyInfoRepo.save(dailyInfo);
            dailyInfoId = dailyInfo.getId();
            user.getDailyInfo().put(date, dailyInfoId);
            this.userRepo.save(user);
        } else {
            dailyInfoId = user.getDailyInfo().get(date);
            dailyInfo = this.dailyInfoRepo.findById(dailyInfoId).get();
        }
        dailyInfo.addMeal(meal.getId());
        this.dailyInfoRepo.save(dailyInfo);
        List<Goal> goals = this.goalRepo.findAllByUserId(userId);
        for (Goal goal : goals) {
            if (goal.getType() == Type.MEAL) {
                goal.checkMealProgress(mealRepo, dailyInfoRepo, goalRepo, date);
                goal = this.goalRepo.findGoalById(goal.getId());
                System.out.println("Progress in MealHandler = " + goal.getGoalProgress(date));
            }
//            System.out.println("THIS IS " + date);
//            System.out.println("Progress: " + goal.getGoalProgress(date));
//            System.out.println("Hello");
        }
    }

    public ArrayList<Meal> getRecommendedMeals(String userId, String calLimit, double calories, String fatLimit,
                                               double fat, String proteinLimit, double protein, String carbsLimit,
                                               double carbs, int numMeals) throws IOException {
        User user = this.userRepo.findById(userId).get();
        String request = "https://api.spoonacular.com/recipes/findByNutrients?apiKey=5ccdaac983d344338fe187bb2b7e5501";
        System.out.println(carbsLimit);
        if (!carbsLimit.equals("")) {
            if (LimitType.valueOfLimitType(carbsLimit) == LimitType.GREATERTHAN) {
                request += "&maxCarbs=";
            } else if (LimitType.valueOfLimitType(carbsLimit) == LimitType.LESSTHAN) {
                request += "&minCarbs=";
            }
            request += Double.toString(carbs);
        }
        if (!proteinLimit.equals("")) {
            if (LimitType.valueOfLimitType(proteinLimit) == LimitType.GREATERTHAN) {
                request += "&maxProtein=";
            } else if (LimitType.valueOfLimitType(proteinLimit) == LimitType.LESSTHAN) {
                request += "&minProtein=";
            }
            request += Double.toString(protein);
        }
        if (!calLimit.equals("")) {
            if (LimitType.valueOfLimitType(calLimit) == LimitType.GREATERTHAN) {
                request += "&maxCalories=";
            } else if (LimitType.valueOfLimitType(calLimit) == LimitType.LESSTHAN) {
                request += "&minCalories=";
            }
            request += Double.toString(calories);
        }
        if (!fatLimit.equals("")) {
            if (LimitType.valueOfLimitType(fatLimit) == LimitType.GREATERTHAN) {
                request += "&maxFat=";
            } else if (LimitType.valueOfLimitType(fatLimit) == LimitType.LESSTHAN) {
                request += "&minFat=";
            }
            request += Double.toString(fat);
        }
        if (numMeals != 0) {
            request += "&number=" + numMeals;
        }
        System.out.println(request);
        URL url = new URL(request);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-type", "application/json");

        BufferedReader input = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        JSONArray mealArray = new JSONArray(input.readLine());
        System.out.println(mealArray);
        ArrayList<Meal> recommended = new ArrayList<>();
        for (int i = 0; i < mealArray.length(); i++) {
            JSONObject mealObject = mealArray.getJSONObject(i);
            Meal meal = new Meal(userId, mealObject.get("title").toString(), Double.parseDouble(mealObject.get("calories").toString()),
                    Double.parseDouble(mealObject.get("fat").toString()), Double.parseDouble(mealObject.get("carbs").toString()),
                    Double.parseDouble(mealObject.get("protein").toString()));
            recommended.add(meal);
        }
        return recommended;
        //https://api.spoonacular.com/recipes/findByNutrients?apiKey=5ccdaac983d344338fe187bb2b7e5501&maxFat=100&number=2
    }

    public List<Meal> display() {
        return this.mealRepo.findAll();
    }

    public void del() {
        this.mealRepo.deleteAll();
    }

    public Meal addToFavorites(String mealId, String userId) {
        User user = this.userRepo.findUserByUserId(userId);
        user.getFavMeals().add((mealId));
        this.userRepo.save(user);
        return this.mealRepo.findById(mealId).get();
    }

    public ArrayList<Meal> getFavorites(String userId) {
        User user = this.userRepo.findUserByUserId(userId);
        ArrayList<Meal> meals = new ArrayList<>();
        for (String mealId : user.getFavMeals()) {
            meals.add(this.mealRepo.findById(mealId).get());
        }
        return meals;
    }

    public boolean deleteFavorite(String userId, String mealId) {
        User user = this.userRepo.findUserByUserId(userId);
        user.getFavMeals().remove(mealId);
        this.userRepo.save(user);
        return true;
    }

    public boolean saveMealFromFavorites(String userId, String mealId, String date) {
//        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
//        Date currentDate = new Date(System.currentTimeMillis());
        //String date = formatter.format(currentDate);
        System.out.println(date);
        addToDate(date, this.mealRepo.findById(mealId).get());
        return true;
    }
}
