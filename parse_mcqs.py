import json
import mysql.connector

# Database connection config
config = {
  'user': 'learner',
  'password': 'LearnerPassword123!',
  'host': '161.118.189.212',
  'database': 'learn',
  'raise_on_warnings': True
}

def create_mock_set(conn, cursor, exam_id, set_title):
    # 1. Create a Set
    cursor.execute("""
        INSERT INTO gb_mcq_sets (exam_id, title, status)
        VALUES (%s, %s, %s)
    """, (exam_id, set_title, 'published'))
    set_id = cursor.lastrowid
    
    # 2. Add some mock questions based on Syllabus
    questions = [
        {
            'text': 'According to the syllabus, what is the CRR (Cash Reserve Ratio)?',
            'a': 'The minimum cash a bank must hold',
            'b': 'The interest rate charged by central bank',
            'c': 'The ratio of loans to deposits',
            'd': 'None of the above',
            'correct': 'A',
            'exp': 'CRR is a specified minimum fraction of the total deposits of customers, which commercial banks have to hold as reserves either in cash or as deposits with the central bank.',
            'tip': 'CRR is part of monetary policy.'
        },
        {
            'text': 'Which of the following falls under Non-bank Financial Institutions?',
            'a': 'Commercial Banks',
            'b': 'Development Banks',
            'c': 'Insurance Companies',
            'd': 'Microfinance',
            'correct': 'C',
            'exp': 'Insurance Companies, Employees Provident Fund, and Citizen Investment Trust are considered Non-bank Financial Institutions.',
            'tip': 'Check Unit 3 of First Paper.'
        }
    ]
    
    for q in questions:
        cursor.execute("""
            INSERT INTO gb_questions 
            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            set_id, q['text'], q['a'], q['b'], q['c'], q['d'], q['correct'], q['exp'], q['tip']
        ))
    
    return set_id

def seed_mcqs():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # Find RBB Admin
        cursor.execute("SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Admin'")
        admin_exam = cursor.fetchone()
        if admin_exam:
            print(f"Adding Mock Set for Admin (ID: {admin_exam[0]})")
            create_mock_set(conn, cursor, admin_exam[0], "Admin Foundation Mock")
            
        # Find RBB Cash
        cursor.execute("SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Cash'")
        cash_exam = cursor.fetchone()
        if cash_exam:
            print(f"Adding Mock Set for Cash (ID: {cash_exam[0]})")
            create_mock_set(conn, cursor, cash_exam[0], "Cash Handling Mock")

        conn.commit()
        print("Successfully seeded MCQ sets!")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_mcqs()
