import 'package:flutter/material.dart';

class UserProvider extends ChangeNotifier {
  int _gyanPoints = 120; // Mock data
  int _streakDays = 3;   // Mock data
  String _currentGoal = 'Lok Sewa Kharidar'; // Mock data

  int get gyanPoints => _gyanPoints;
  int get streakDays => _streakDays;
  String get currentGoal => _currentGoal;

  void addPoints(int points) {
    _gyanPoints += points;
    notifyListeners();
  }

  void setGoal(String goal) {
    _currentGoal = goal;
    notifyListeners();
  }

  // TODO: Add methods to sync these with Firebase/PHP backend
}
