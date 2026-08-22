import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../utils/api_constants.dart';

class ExamProvider with ChangeNotifier {
  List<dynamic> _categories = [];
  List<dynamic> _exams = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get categories => _categories;
  List<dynamic> get exams => _exams;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch Categories from Live API
  Future<void> fetchCategories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('${ApiConstants.mcqApi}?action=getCategories'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          _categories = data['data'];
        } else {
          _error = data['message'];
        }
      } else {
        _error = 'Failed to load categories';
      }
    } catch (e) {
      _error = 'Network error: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch Exams from Live API (Optional category filter)
  Future<void> fetchExams({String? categoryId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String url = '${ApiConstants.mcqApi}?action=getExams';
      if (categoryId != null && categoryId.isNotEmpty) {
        url += '&category_id=$categoryId';
      }
      
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          _exams = data['data'];
        } else {
          _error = data['message'];
        }
      } else {
        _error = 'Failed to load exams';
      }
    } catch (e) {
      _error = 'Network error: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch specific questions for an exam
  Future<Map<String, dynamic>?> fetchQuestionsForExam(String examId) async {
    try {
      final response = await http.get(Uri.parse('${ApiConstants.mcqApi}?action=getQuestions&exam_id=$examId'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          return data; // Contains 'set_info' and 'questions'
        }
      }
    } catch (e) {
      debugPrint('Error fetching questions: $e');
    }
    return null;
  }
}
