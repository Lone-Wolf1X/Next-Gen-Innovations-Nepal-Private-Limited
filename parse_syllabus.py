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

def seed_data():
    try:
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
        # From JSON, we have: RBB Level 5 Cash and Admin
        # But there are two distinct papers for Admin and Cash in the second phase.
        # Let's create two separate exam entries for better MCQ targeting.
        
        exams_to_insert = [
            ("RBB Level 5 - Admin", "Rastriya Banijya Bank Level 5 Senior Assistant (Admin)"),
            ("RBB Level 5 - Cash", "Rastriya Banijya Bank Level 5 Senior Assistant (Cash)")
        ]
        
        for title, desc in exams_to_insert:
            cursor.execute("SELECT id FROM gb_exams WHERE title = %s", (title,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO gb_exams (category_id, title, description, status) 
                    VALUES (%s, %s, %s, %s)
                """, (category_id, title, desc, 'active'))
                
        conn.commit()
        print("Successfully seeded RBB exams into the live database!")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_data()
