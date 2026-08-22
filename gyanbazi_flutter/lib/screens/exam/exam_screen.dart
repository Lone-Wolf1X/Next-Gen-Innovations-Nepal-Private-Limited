import 'dart:async';
import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class ExamScreen extends StatefulWidget {
  final String vacancyId;
  final String vacancyTitle;

  const ExamScreen({
    super.key,
    required this.vacancyId,
    required this.vacancyTitle,
  });

  @override
  State<ExamScreen> createState() => _ExamScreenState();
}

class _ExamScreenState extends State<ExamScreen> {
  int _currentIndex = 0;
  
  // Mock Questions Data - Updated for Post-Answer flow
  final List<Map<String, dynamic>> _questions = [
    {
      'id': 'q_1',
      'questionText': 'नेपालको संविधानमा मौलिक हक कति वटा छन्?',
      'options': {
        'A': '25',
        'B': '31',
        'C': '35',
        'D': '37',
      },
      'correctOption': 'B',
      'explanation': 'नेपालको संविधानको भाग ३ मा ३१ वटा मौलिक हक सम्बन्धी व्यवस्था गरिएको छ।',
      'tip': 'यो topic Lok Sewa मा frequently पूछिने topics मध्ये एक हो।',
      'subject': 'Constitution',
    },
    {
      'id': 'q_2',
      'questionText': 'What is the capital of Nepal?',
      'options': {
        'A': 'Pokhara',
        'B': 'Lumbini',
        'C': 'Kathmandu',
        'D': 'Chitwan',
      },
      'correctOption': 'C',
      'explanation': 'Kathmandu is the capital and largest city of Nepal.',
      'tip': 'Basic geography is always asked in section 1.',
      'subject': 'Geography',
    }
  ];

  final Map<String, String> _answers = {};
  final Set<String> _checkedQuestions = {};

  void _submitExam() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Exam Submitted'),
        content: const Text('Your answers have been submitted successfully.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to dashboard
            },
            child: const Text('View Results'),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentQ = _questions[_currentIndex];
    final qId = currentQ['id'];
    final selectedOption = _answers[qId];
    final isChecked = _checkedQuestions.contains(qId);
    final isCorrect = selectedOption == currentQ['correctOption'];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('${currentQ['subject']} • ${_currentIndex + 1}/${_questions.length}', style: const TextStyle(fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.bookmark_outline_rounded), onPressed: () {}),
          IconButton(icon: const Icon(Icons.flag_outlined, color: Colors.redAccent), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Question Text
                  Text(
                    'Question',
                    style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    currentQ['questionText'],
                    style: const TextStyle(fontSize: 22, height: 1.4, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 32),
                  
                  // Options
                  ...['A', 'B', 'C', 'D'].map((key) {
                    final isSelected = selectedOption == key;
                    final isThisCorrect = key == currentQ['correctOption'];
                    
                    Color borderColor = Colors.grey.shade300;
                    Color bgColor = Colors.white;
                    Color textColor = AppTheme.textColor;
                    
                    if (isChecked) {
                      if (isThisCorrect) {
                        borderColor = AppTheme.successColor;
                        bgColor = AppTheme.successColor.withOpacity(0.05);
                        textColor = AppTheme.successColor;
                      } else if (isSelected && !isThisCorrect) {
                        borderColor = Colors.redAccent;
                        bgColor = Colors.redAccent.withOpacity(0.05);
                        textColor = Colors.redAccent;
                      }
                    } else if (isSelected) {
                      borderColor = AppTheme.primaryColor;
                      bgColor = AppTheme.primaryColor.withOpacity(0.05);
                      textColor = AppTheme.primaryColor;
                    }

                    return InkWell(
                      onTap: isChecked ? null : () {
                        setState(() {
                          _answers[qId] = key;
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        decoration: BoxDecoration(
                          color: bgColor,
                          border: Border.all(color: borderColor, width: isSelected || (isChecked && isThisCorrect) ? 2 : 1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 28, height: 28,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: isChecked && (isThisCorrect || isSelected) ? Colors.transparent : borderColor),
                                color: isChecked && isThisCorrect ? AppTheme.successColor : 
                                       isChecked && isSelected ? Colors.redAccent :
                                       isSelected ? AppTheme.primaryColor : Colors.transparent,
                              ),
                              child: isChecked && isThisCorrect
                                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 18)
                                  : isChecked && isSelected
                                      ? const Icon(Icons.close_rounded, color: Colors.white, size: 18)
                                      : Text(
                                          key,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: isSelected ? Colors.white : Colors.grey.shade600,
                                          ),
                                        ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                currentQ['options'][key],
                                style: TextStyle(fontSize: 16, color: textColor, fontWeight: isSelected || (isChecked && isThisCorrect) ? FontWeight.bold : FontWeight.normal),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                  
                  // Post-Answer Explanation
                  if (isChecked) ...[
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 24),
                    if (isCorrect) ...[
                      const Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: AppTheme.successColor),
                          SizedBox(width: 8),
                          Text('Correct Answer!', style: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 18)),
                        ],
                      ),
                    ] else ...[
                      const Row(
                        children: [
                          Icon(Icons.cancel_rounded, color: Colors.redAccent),
                          SizedBox(width: 8),
                          Text('Not quite!', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 18)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Correct Answer: ${currentQ['correctOption']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('This question was added to "My Mistakes" automatically.', style: TextStyle(color: Colors.grey.shade600, fontStyle: FontStyle.italic)),
                    ],
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.amber.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.lightbulb_rounded, color: Colors.amber),
                              SizedBox(width: 8),
                              Text('Explanation', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(currentQ['explanation'], style: const TextStyle(height: 1.5)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.local_fire_department_rounded, color: AppTheme.secondaryColor),
                              SizedBox(width: 8),
                              Text('Exam Tip', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.secondaryColor)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(currentQ['tip'], style: const TextStyle(height: 1.5)),
                        ],
                      ),
                    ),
                  ]
                ],
              ),
            ),
          ),
          
          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: selectedOption == null ? null : () {
                  if (!isChecked) {
                    setState(() {
                      _checkedQuestions.add(qId);
                    });
                  } else {
                    if (_currentIndex < _questions.length - 1) {
                      setState(() => _currentIndex++);
                    } else {
                      _submitExam();
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  backgroundColor: isChecked ? AppTheme.textColor : AppTheme.primaryColor,
                ),
                child: Text(
                  !isChecked ? 'Check Answer' : (_currentIndex < _questions.length - 1 ? 'Next Question →' : 'Finish Practice'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
