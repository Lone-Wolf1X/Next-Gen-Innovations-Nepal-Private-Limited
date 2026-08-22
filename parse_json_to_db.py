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

def parse_syllabus():
    try:
        with open('gyanbazi_flutter/rbb-level5-complete-syllabus-structure.json', 'r') as f:
            syllabus = json.load(f)
            
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # 1. Ensure Category exists
        category_name = "Banking"
        cursor.execute("SELECT id FROM gb_categories WHERE name = %s", (category_name,))
        cat_result = cursor.fetchone()
        
        if cat_result:
            category_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO gb_categories (name, icon, status) VALUES (%s, %s, %s)", 
                          (category_name, '🏦', 'active'))
            category_id = cursor.lastrowid

        # 2. Add the Exams
        exams_to_insert = [
            ("RBB Level 5 - Admin", f"{syllabus['organization']} - {syllabus['exam_name']} (Admin)"),
            ("RBB Level 5 - Cash", f"{syllabus['organization']} - {syllabus['exam_name']} (Cash)")
        ]
        
        exam_ids = {}
        for title, desc in exams_to_insert:
            cursor.execute("SELECT id FROM gb_exams WHERE title = %s", (title,))
            result = cursor.fetchone()
            if result:
                exam_ids[title] = result[0]
            else:
                cursor.execute("""
                    INSERT INTO gb_exams (category_id, title, description, status) 
                    VALUES (%s, %s, %s, %s)
                """, (category_id, title, desc, 'active'))
                exam_ids[title] = cursor.lastrowid
                
        # 3. Create MCQ sets based on sections for Admin
        admin_id = exam_ids["RBB Level 5 - Admin"]
        cash_id = exam_ids["RBB Level 5 - Cash"]
        
        for phase in syllabus['phases']:
            for paper in phase['papers']:
                for section in paper.get('sections', []):
                    set_title = f"{paper['paper_name']} - {section['section_name']}"
                    
                    # Decide which exam this belongs to
                    target_exam_id = admin_id
                    if "Cash" in paper['paper_name']:
                        target_exam_id = cash_id
                    
                    # Create the set
                    cursor.execute("""
                        INSERT INTO gb_mcq_sets (exam_id, title, status)
                        VALUES (%s, %s, %s)
                    """, (target_exam_id, set_title, 'draft'))
                    set_id = cursor.lastrowid
                    
                    # Generate some dummy questions based on topics for now
                    for i, topic in enumerate(section.get('topics', [])[:2]): # limit to 2 per section
                        cursor.execute("""
                            INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            set_id, 
                            f"Question related to: {topic[:100]}...",
                            "Option A", "Option B", "Option C", "Option D",
                            "A", 
                            f"Explanation for {topic[:50]}...",
                            "Study this topic well!"
                        ))

        conn.commit()
        print("Successfully parsed syllabus JSON and seeded into live database!")

    except Exception as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    parse_syllabus()
