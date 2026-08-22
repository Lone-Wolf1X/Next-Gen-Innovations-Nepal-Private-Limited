class ApiConstants {
  static const String baseUrl = 'https://nextgeninnovations.com.np/learn/backend/api';

  // Auth endpoints
  static const String syncUser = '$baseUrl/users.php?action=sync';
  static const String completeProfile = '$baseUrl/users.php?action=completeProfile';
  static const String recordLogin = '$baseUrl/users.php?action=recordLogin';

  // Other endpoints (to be added as we build them)
  static const String getVacancies = '$baseUrl/vacancies.php?action=getAllAdmin';
}
