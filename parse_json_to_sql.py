import json

def parse_syllabus():
    try:
        with open('gyanbazi_flutter/rbb-level5-complete-syllabus-structure.json', 'r') as f:
            syllabus = json.load(f)
            
        sql = []
        
        # 1. Ensure Category exists
        category_name = "Banking"
        sql.append(f"INSERT INTO gb_categories (name, icon, status) SELECT '{category_name}', '🏦', 'active' WHERE NOT EXISTS (SELECT 1 FROM gb_categories WHERE name = '{category_name}');")
        sql.append(f"SET @cat_id = (SELECT id FROM gb_categories WHERE name = '{category_name}');")
        
        # 2. Add the Exams
        exams_to_insert = [
            ("RBB Level 5 - Admin", f"{syllabus['organization']} - {syllabus['exam_name']} (Admin)"),
            ("RBB Level 5 - Cash", f"{syllabus['organization']} - {syllabus['exam_name']} (Cash)")
        ]
        
        for title, desc in exams_to_insert:
            sql.append(f"INSERT INTO gb_exams (category_id, title, description, status) SELECT @cat_id, '{title}', '{desc}', 'active' WHERE NOT EXISTS (SELECT 1 FROM gb_exams WHERE title = '{title}');")
            
        # 3. Create MCQ sets based on sections
        for phase in syllabus['phases']:
            for paper in phase['papers']:
                for section in paper.get('sections', []):
                    set_title = f"{paper['paper_name']} - {section['section_name']}"
                    
                    # Decide which exam this belongs to
                    target_exam_title = "RBB Level 5 - Admin"
                    if "Cash" in paper['paper_name']:
                        target_exam_title = "RBB Level 5 - Cash"
                    
                    # Create the set
                    sql.append(f"SET @exam_id = (SELECT id FROM gb_exams WHERE title = '{target_exam_title}');")
                    sql.append(f"INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, '{set_title}', 'published');")
                    sql.append("SET @set_id = LAST_INSERT_ID();")
                    
                    # Generate some dummy questions based on topics for now
                    for i, topic in enumerate(section.get('topics', [])[:2]): # limit to 2 per section
                        clean_topic = topic.replace("'", "''")
                        q_text = f"What is a key concept of: {clean_topic[:80]}...?"
                        exp = f"This is an automated placeholder for {clean_topic[:40]}..."
                        sql.append(f"""INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, '{q_text}', 'Option A', 'Option B', 'Option C', 'Option D', 'A', '{exp}', 'Review syllabus!');""")

        with open('seed_rbb_syllabus.sql', 'w') as f:
            f.write("\n".join(sql))
            
        print("Successfully generated seed_rbb_syllabus.sql!")

    except Exception as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    parse_syllabus()
