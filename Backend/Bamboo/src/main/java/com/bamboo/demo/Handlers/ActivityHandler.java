package com.bamboo.demo.Handlers;

import com.bamboo.demo.Models.*;
import com.bamboo.demo.Repos.ActivityRepo;
import com.bamboo.demo.Repos.DailyInfoRepo;
import com.bamboo.demo.Repos.GoalRepo;
import com.bamboo.demo.Repos.UserRepo;
import org.json.JSONException;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ActivityHandler {
    private ActivityRepo activityRepo;
    private UserRepo userRepo;
    private DailyInfoRepo dailyInfoRepo;
    private GoalRepo goalRepo;

    public ActivityHandler(UserRepo userRepo, DailyInfoRepo dailyInfoRepo,
                           ActivityRepo activityRepo, GoalRepo goalRepo) {
        this.userRepo = userRepo;
        this.dailyInfoRepo = dailyInfoRepo;
        this.activityRepo = activityRepo;
        this.goalRepo = goalRepo;
    }


    // Distance is in km, time is in minutes
    public Activity saveActivity(String userId, String activityName, int time, double distance,
                                 Date date) throws IOException, JSONException {
        User user = this.userRepo.findById(userId).get();

        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        String dateFormat = formatter.format(date);

        Activity activity = new Activity(userId, activityName, time);
        double MET = findMET(activity, distance);
        int newCalories = (int) Math.round(MET * user.getWeight() * time / 60);

        activity.setCalories(newCalories);
        this.activityRepo.save(activity);

        addToDate(dateFormat, activity);

        return activity;
    }

    public double findMET(Activity activity, double distance) {
        if (activity.getType().equalsIgnoreCase("running")) {
            System.out.println("Activity = running");
            double[] runningSpeeds = {4.0, 5.0, 5.2, 6.0, 6.7, 7.0, 7.5, 8, 8.6, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0};
            // distance matters
            // speed = mph
            double speed = (distance * 0.621371) / (activity.getMinutes() / 60.0);
            if (speed > runningSpeeds[runningSpeeds.length - 1]) {
                speed = runningSpeeds[runningSpeeds.length - 1];
            } else {
                for (double runningSpeed : runningSpeeds) {
                    if (speed <= runningSpeed) {
                        speed = runningSpeed;
                        break;
                    }
                }
            }
            double MET = 0.0;
            if (activity.getMETValues().containsKey(activity.getType().toLowerCase()
                    + " " + (String.format("%.1f", speed)).replace('.', '-'))) {
                MET = activity.getMETValues().get(activity.getType().toLowerCase() + " " +
                        (String.format("%.1f", speed)).replace('.', '-'));
            }
            return MET;
        } else {
            //distance v=can be ignored
            double MET = 0.0;
            if (activity.getMETValues().containsKey(activity.getType().toLowerCase())) {
                MET = activity.getMETValues().get(activity.getType().toLowerCase());
            }
            return MET;
        }
    }


    public void addToDate(String date, Activity activity) {
        String userId = activity.getUserId();
        User user = this.userRepo.findById(userId).get();
        String dailyInfoId;
        DailyInfo dailyInfo;
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
        dailyInfo.addActivity(activity.getId());
        this.dailyInfoRepo.save(dailyInfo);
        List<Goal> goals = this.goalRepo.findAllByUserId(userId);
        for (Goal goal : goals) {
            if (goal.getType() == Type.EXERCISE) {
                goal.checkExerciseProgress(activityRepo, dailyInfoRepo, goalRepo, date);
            }
        }

    }

    public List<Activity> display() {
        return this.activityRepo.findAll();
    }

    public void del() {
        this.activityRepo.deleteAll();
    }

    public Activity addToFavorites(String activityId, String userId) {
        User user = this.userRepo.findUserByUserId(userId);
        user.getFavExerciseRoutine().add((activityId));
        this.userRepo.save(user);
        return this.activityRepo.findById(activityId).get();
    }

    public ArrayList<Activity> getFavorites(String userId) {
        User user = this.userRepo.findUserByUserId(userId);
        ArrayList<Activity> activities = new ArrayList<>();
        for (String activityId : user.getFavExerciseRoutine()) {
            activities.add(this.activityRepo.findById(activityId).get());
        }
        return activities;
    }

    public boolean deleteFavorite(String userId, String activityId) {
        User user = this.userRepo.findUserByUserId(userId);
        user.getFavExerciseRoutine().remove(activityId);
        this.userRepo.save(user);
        return true;
    }

    public boolean saveActivityFromFavorites(String userId, String activityId, String date) {
        addToDate(date, this.activityRepo.findById(activityId).get());
        return true;
    }
}
