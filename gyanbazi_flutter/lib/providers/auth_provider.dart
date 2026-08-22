import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../utils/api_constants.dart';

class AuthProvider with ChangeNotifier {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  User? _user;
  bool _isLoading = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _checkCurrentUser();
  }

  void _checkCurrentUser() {
    _firebaseAuth.authStateChanges().listen((User? user) {
      _user = user;
      notifyListeners();
    });
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  Future<bool> signIn(String email, String password) async {
    _setLoading(true);
    try {
      final UserCredential credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        await _recordLogin(credential.user!);
        return true;
      }
      return false;
    } on FirebaseAuthException catch (e) {
      debugPrint('Login Error: ${e.message}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> signInWithGoogle() async {
    _setLoading(true);
    try {
      UserCredential userCredential;
      if (kIsWeb) {
        GoogleAuthProvider googleProvider = GoogleAuthProvider();
        userCredential = await _firebaseAuth.signInWithPopup(googleProvider);
      } else {
        final GoogleSignIn googleSignIn = GoogleSignIn();
        final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
        
        if (googleUser == null) {
          _setLoading(false);
          return false;
        }

        final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
        final OAuthCredential credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );

        userCredential = await _firebaseAuth.signInWithCredential(credential);
      }
      
      if (userCredential.user != null) {
        await _syncUserWithBackend(
          userCredential.user!, 
          userCredential.user!.displayName ?? 'Google User', 
          '', 
          '',
        );
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Google Sign-In Error: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> signUp(String name, String email, String password, String phone, String location) async {
    _setLoading(true);
    try {
      final UserCredential credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        await credential.user!.updateDisplayName(name);
        // Sync with backend
        await _syncUserWithBackend(credential.user!, name, phone, location);
        return true;
      }
      return false;
    } on FirebaseAuthException catch (e) {
      debugPrint('Signup Error: ${e.message}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOut() async {
    await _firebaseAuth.signOut();
  }

  Future<void> _syncUserWithBackend(User firebaseUser, String name, String phone, String location) async {
    try {
      final idToken = await firebaseUser.getIdToken();
      final response = await http.post(
        Uri.parse(ApiConstants.syncUser),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
        body: jsonEncode({
          'uid': firebaseUser.uid,
          'email': firebaseUser.email,
          'displayName': name,
          'phone': phone,
          'location': location,
        }),
      );
      debugPrint('Sync response: ${response.body}');
    } catch (e) {
      debugPrint('Sync Error: $e');
    }
  }

  Future<void> _recordLogin(User firebaseUser) async {
    try {
      final idToken = await firebaseUser.getIdToken();
      await http.get(
        Uri.parse(ApiConstants.recordLogin),
        headers: {
          'Authorization': 'Bearer $idToken',
        },
      );
    } catch (e) {
      debugPrint('Record Login Error: $e');
    }
  }
}
