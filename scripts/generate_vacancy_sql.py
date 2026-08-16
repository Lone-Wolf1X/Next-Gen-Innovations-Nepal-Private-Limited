import uuid

def generate_sql():
    sql = "USE next_gen_db;\n\n"
    
    vacancy_id = str(uuid.uuid4())
    
    sql += f"""
SET @cat_id = (SELECT id FROM exam_categories WHERE name = 'CTET' LIMIT 1);

-- Create Course (Vacancy)
INSERT INTO vacancies (id, category_id, title, description, application_open_date, application_close_date, has_objective, has_subjective)
SELECT '{vacancy_id}', @cat_id, 'CTET Complete Preparation', 'Comprehensive preparation course for Central Teacher Eligibility Test (CTET). Includes mock tests and CDP model sets.', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), TRUE, FALSE
FROM DUAL
WHERE NOT EXISTS (SELECT id FROM vacancies WHERE title = 'CTET Complete Preparation' AND category_id = @cat_id);

SET @vac_id = (SELECT id FROM vacancies WHERE title = 'CTET Complete Preparation' AND category_id = @cat_id LIMIT 1);

-- Link existing CTET model sets to this course
UPDATE model_sets 
SET vacancy_id = @vac_id 
WHERE category_id = @cat_id AND title = 'CTET CDP 25-Question Mock Set';
"""
    
    with open('insert_vacancy.sql', 'w') as f:
        f.write(sql)
    print("Generated insert_vacancy.sql")

if __name__ == '__main__':
    generate_sql()
