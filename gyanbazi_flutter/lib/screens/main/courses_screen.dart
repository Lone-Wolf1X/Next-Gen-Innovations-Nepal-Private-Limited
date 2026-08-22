import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/app_theme.dart';
import '../../providers/exam_provider.dart';

class CoursesScreen extends StatelessWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Consumer<ExamProvider>(
        builder: (context, examProvider, child) {
          if (examProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (examProvider.error != null) {
            return Center(
              child: Text(
                'Error: ${examProvider.error}',
                style: const TextStyle(color: Colors.red),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Courses',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textColor,
                  ),
                ),
                const SizedBox(height: 24),
                
                // Search Bar
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search exam, subject...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
                const SizedBox(height: 32),
                
                // Your Exams (Mocked for now since user enrollment isn't in DB yet)
                Text(
                  'Your Exams',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildYourExamCard('🇳🇵', 'Lok Sewa', 'Kharidar', AppTheme.primaryColor)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildYourExamCard('🏦', 'Banking', 'RBB Assistant', AppTheme.secondaryColor)),
                  ],
                ),
                const SizedBox(height: 40),
                
                // Explore Exams (Dynamic from DB)
                Text(
                  'Explore Exams',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                ...examProvider.categories.map((category) {
                  final catExams = examProvider.exams
                      .where((e) => e['category_id'].toString() == category['id'].toString())
                      .toList();
                  
                  if (catExams.isEmpty) return const SizedBox.shrink();

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 24.0),
                    child: _buildExploreCategory(
                      category['name'], 
                      catExams,
                    ),
                  );
                }),
                const SizedBox(height: 40),
              ],
            ),
          );
        }
      ),
    );
  }

  Widget _buildYourExamCard(String emoji, String title, String subtitle, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textColor)),
          Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildExploreCategory(String title, List<dynamic> exams) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade700, fontSize: 16),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: exams.map((exam) {
            return InkWell(
              onTap: () {
                // Navigate to exam practice or detail screen
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(exam['emoji_icon'] ?? '', style: const TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    Text(exam['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
