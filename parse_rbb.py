import re
import json

def parse_questions(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    
    # Split by double newline or regex pattern for "number."
    blocks = re.split(r'\n(?=\d+\.\s)', content)
    
    for i, block in enumerate(blocks):
        block = block.strip()
        if not block: continue
        
        # Parse question text
        lines = block.split('\n')
        q_text_lines = []
        options = {}
        answer = ''
        
        for line in lines:
            line = line.strip()
            if line.startswith('A. '): options['a'] = line[3:]
            elif line.startswith('B. '): options['b'] = line[3:]
            elif line.startswith('C. '): options['c'] = line[3:]
            elif line.startswith('D. '): options['d'] = line[3:]
            elif line.startswith('Answer: '): answer = line[8:].lower().strip()
            else:
                if re.match(r'^\d+\.', line):
                    line = re.sub(r'^\d+\.\s*', '', line)
                q_text_lines.append(line)
        
        q_text = '<br>'.join([l for l in q_text_lines if l])
        
        if options and answer:
            q_id = f"q_rbb_{i+1}"
            
            # Map subjects based on question number ranges
            # Section A: 1-25 (Economics, Financial Market & Financial Institutions)
            # Section B: 31-55 (Digital Payment, Banking Terminology & General Knowledge)
            # We'll map to our subjects:
            # 1-7: Economics (sub-rbb-p1-1)
            # 8-17: Financial Market (sub-rbb-p1-2)
            # 18-25: Financial Institutions (sub-rbb-p1-3)
            # 31-40: Digital Payment & RTGS (sub-rbb-p2-2)
            # 41-55: General Knowledge & Others (sub-rbb-p2-2)
            
            subject_id = 'sub-rbb-p1-1'
            if 8 <= i+1 <= 17: subject_id = 'sub-rbb-p1-2'
            elif 18 <= i+1 <= 25: subject_id = 'sub-rbb-p1-3'
            elif i+1 > 25: subject_id = 'sub-rbb-p2-2'

            questions.append({
                'id': q_id,
                'category_id': 'cat-rbb',
                'subject_id': subject_id,
                'question_text': q_text.replace("'", "''"),
                'options': json.dumps(options).replace("'", "''"),
                'correct_option': answer,
                'explanation': 'Explanation available in detailed guide.',
            })
            
    return questions

def generate_sql(questions):
    sql = ""
    for q in questions:
        sql += f"INSERT IGNORE INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, marks, negative_marks, status) VALUES "
        sql += f"('{q['id']}', '{q['category_id']}', '{q['subject_id']}', '{q['question_text']}', '{q['options']}', '{q['correct_option']}', '{q['explanation']}', 1.0, 0.2, 'published');\n"
    
    # Generate model set
    q_ids = json.dumps([q['id'] for q in questions])
    sql += "\n"
    sql += f"INSERT IGNORE INTO model_sets (id, title, description, category_id, question_ids, time_limit_minutes, total_marks, status) VALUES "
    sql += f"('mset-rbb-full-1', 'RBB Level 5 Pre-Test (Full Set)', 'Comprehensive 50 MCQ model set based on current official syllabus.', 'cat-rbb', '{q_ids}', 45, 50.00, 'published');\n"
    
    with open('seed_rbb_full.sql', 'w') as f:
        f.write(sql)

questions = parse_questions('rbb_raw.txt')
generate_sql(questions)
print(f"Generated seed_rbb_full.sql with {len(questions)} questions.")
