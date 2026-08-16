import json
import uuid

ctet_data = [
  {
    "q_no": 1,
    "question": "Which of the following statements denotes the relationship between development and learning correctly?",
    "options": {
      "A": "Learning and development are parallel processes not interrelated.",
      "B": "Developmental pace lags behind the learning process.",
      "C": "Learning and development are interrelated and interdependent.",
      "D": "Development is completely independent of learning."
    },
    "correct_option": "C",
    "explanation": "Development and learning have a bidirectional relationship. According to modern educational psychology and thinkers like Vygotsky, learning and development are dynamic, complexly interconnected, and influence each other throughout life."
  },
  {
    "q_no": 2,
    "question": "According to Jean Piaget, during which stage of cognitive development does a child develop 'Object Permanence'?",
    "options": {
      "A": "Sensorimotor Stage",
      "B": "Pre-operational Stage",
      "C": "Concrete Operational Stage",
      "D": "Formal Operational Stage"
    },
    "correct_option": "A",
    "explanation": "Object permanence—the understanding that objects continue to exist even when they cannot be seen or heard—typically develops during the sensorimotor stage (birth to 2 years), usually around 8 months of age."
  },
  {
    "q_no": 3,
    "question": "According to Lev Vygotsky, what is the primary cause of cognitive development?",
    "options": {
      "A": "Biological maturation",
      "B": "Social interaction",
      "C": "Stimulus-response pairing",
      "D": "Equilibration"
    },
    "correct_option": "B",
    "explanation": "Lev Vygotsky's Socio-Cultural theory emphasizes that human intelligence originates in society or culture, and social interaction is the foundational element driving cognitive growth."
  },
  {
    "q_no": 4,
    "question": "A teacher provides hints and cues to students while they solve a complex puzzle. In Vygotsky's theory, this temporary assistance is called:",
    "options": {
      "A": "Reinforcement",
      "B": "Egocentric Speech",
      "C": "Scaffolding",
      "D": "Conditioning"
    },
    "correct_option": "C",
    "explanation": "Scaffolding is a process through which a teacher or a More Knowledgeable Other (MKO) offers temporary support to a learner in the Zone of Proximal Development (ZPD) to help them accomplish a task they cannot do independently."
  },
  {
    "q_no": 5,
    "question": "In Kohlberg's theory of moral development, at which stage do individuals make moral decisions based on universal ethical principles and human rights?",
    "options": {
      "A": "Punishment and Obedience orientation",
      "B": "Good boy-Nice girl orientation",
      "C": "Social contract orientation",
      "D": "Universal Ethical Principle orientation"
    },
    "correct_option": "D",
    "explanation": "The Universal Ethical Principle orientation represents Stage 6 (Post-Conventional Level), where moral reasoning is based on abstract principles of justice, equality, and human rights, independent of laws or social agreements."
  },
  {
    "q_no": 6,
    "question": "Which of the following is a characteristic of a Progressive Classroom?",
    "options": {
      "A": "Focus on rote memorization and passive listening.",
      "B": "Flexible seating arrangements and emphasis on collaborative learning.",
      "C": "Frequent use of rewards and punishments to control behavior.",
      "D": "Strict textbook-centric teaching with no scope for activities."
    },
    "correct_option": "B",
    "explanation": "Progressive education (advocated by John Dewey) emphasizes learning by doing, hands-on activities, critical thinking, flexible seating, and cooperative or democratic group learning."
  },
  {
    "q_no": 7,
    "question": "Child-centered pedagogy means:",
    "options": {
      "A": "Giving primacy to children's voices, experiences, and active participation.",
      "B": "Asking children to copy down everything the teacher writes on the board.",
      "C": "The complete control of the classroom by the teacher.",
      "D": "Setting strict curriculum and testing schedules for children."
    },
    "correct_option": "A",
    "explanation": "Child-centered pedagogy values the active nature, inherent capabilities, interests, and lived experiences of the child, shifting the role of the teacher from an authority figure to a facilitator."
  },
  {
    "q_no": 8,
    "question": "According to Howard Gardner's theory of Multiple Intelligences, a person who can understand and manage the emotions, motivations, and desires of OTHER people possesses:",
    "options": {
      "A": "Intrapersonal Intelligence",
      "B": "Interpersonal Intelligence",
      "C": "Spatial Intelligence",
      "D": "Naturalistic Intelligence"
    },
    "correct_option": "B",
    "explanation": "Interpersonal intelligence deals with understanding and interacting effectively with other people. Intrapersonal intelligence, by contrast, is the capacity to understand oneself."
  },
  {
    "q_no": 9,
    "question": "Continuous and Comprehensive Evaluation (CCE) primarily emphasizes:",
    "options": {
      "A": "Testing of cognitive abilities only at the end of the term.",
      "B": "How learning can be observed, recorded, and improved.",
      "C": "Comparing learners with one another using rigid ranking systems.",
      "D": "Rote recall of facts under exam pressure."
    },
    "correct_option": "B",
    "explanation": "CCE aims to evaluate all aspects of a child's development continuously, focusing on formative processes that map out how learning can be recorded, tracked, and remediated to improve student outcomes."
  },
  {
    "q_no": 10,
    "question": "An inclusive classroom is one where:",
    "options": {
      "A": "Only gifted and talented students are given admission.",
      "B": "Students from diverse backgrounds and different abilities learn together under a single roof.",
      "C": "Disabled students are taught separately in specialized rooms.",
      "D": "Teachers follow uniform instruction methods regardless of individual differences."
    },
    "correct_option": "B",
    "explanation": "Inclusive education means educating all students—regardless of any physical, social, emotional, linguistic, or cognitive differences—together in regular classrooms with appropriate structural support."
  },
  {
    "q_no": 11,
    "question": "A child has persistent difficulty in reading text, spelling words correctly, and decoding passages. The child is likely showing signs of:",
    "options": {
      "A": "Dysgraphia",
      "B": "Dyscalculia",
      "C": "Dyslexia",
      "D": "ADHD"
    },
    "correct_option": "C",
    "explanation": "Dyslexia is a specific neurological learning disability characterized by difficulties with accurate and fluent word recognition, reading, and spelling."
  },
  {
    "q_no": 12,
    "question": "Which of the following is an effective strategy to reduce gender stereotyping and gender role conformity among school children?",
    "options": {
      "A": "Forming separate gender-based rows or seating arrangements in class.",
      "B": "Encouraging stereotypical toys (e.g., dolls for girls, trucks for boys).",
      "C": "Discussions on non-stereotypical gender roles (e.g., male chefs, female pilots).",
      "D": "Assigning physical tasks only to boys and cleaning tasks to girls."
    },
    "correct_option": "C",
    "explanation": "Open classroom discussions about counter-stereotypical examples challenge traditional gender boundaries and allow children to perceive gender roles in an egalitarian manner."
  },
  {
    "q_no": 13,
    "question": "To foster critical thinking in her classroom, a teacher should encourage students to:",
    "options": {
      "A": "Memorize definitions given word-for-word in the textbook.",
      "B": "Analyze a problem from multiple perspectives and find open-ended solutions.",
      "C": "Accept information from authoritative sources blindly.",
      "D": "Avoid working on complex tasks and complete worksheets quickly."
    },
    "correct_option": "B",
    "explanation": "Critical thinking involves analyzing, evaluating, looking at multi-perspective data, and breaking down a problem to arrive at logic-backed, open-ended conclusions rather than rote replication."
  },
  {
    "q_no": 14,
    "question": "Which of the following statements about errors made by children during the learning process is correct?",
    "options": {
      "A": "Errors indicate that children are intellectually deficient.",
      "B": "Errors are windows into children's thinking and are a natural part of learning.",
      "C": "Errors must be heavily penalized immediately to stop recurrence.",
      "D": "Errors have no relevance in pedagogical planning."
    },
    "correct_option": "B",
    "explanation": "Errors are not signs of failure; they are diagnostic windows that show how children construct alternative conceptual structures. They are a necessary step in cognitive maturation."
  },
  {
    "q_no": 15,
    "question": "According to Piaget, the process of adjusting or changing existing mental schemas in response to new information is called:",
    "options": {
      "A": "Assimilation",
      "B": "Accommodation",
      "C": "Organization",
      "D": "Egocentrism"
    },
    "correct_option": "B",
    "explanation": "Accommodation is modifying existing schemas or creating new ones because new information does not fit neatly into pre-existing schemas. (Fitting new info into existing schemas without modification is Assimilation)."
  },
  {
    "q_no": 16,
    "question": "When a child learns to use a pen to write after having mastered holding a large ball, this progression from gross motor skills to fine motor skills exemplifies:",
    "options": {
      "A": "Cephalocaudal Principle",
      "B": "Proximodistal Principle",
      "C": "Principle of Interrelation",
      "D": "Principle of Discontinuity"
    },
    "correct_option": "B",
    "explanation": "The Proximodistal principle states that development proceeds from the center of the body outward. Control over large muscles (gross motor) happens before fine motor precision in fingers."
  },
  {
    "q_no": 17,
    "question": "Which type of motivation is driven by internal rewards, such as personal satisfaction, curiosity, or the joy of learning?",
    "options": {
      "A": "Extrinsic Motivation",
      "B": "Intrinsic Motivation",
      "C": "Social Motivation",
      "D": "Fear-based Motivation"
    },
    "correct_option": "B",
    "explanation": "Intrinsic motivation arises from within the individual. The task itself provides joy or satisfying value, requiring no external tangible reward like scores, trophies, or money."
  },
  {
    "q_no": 18,
    "question": "Which of the following is an example of an 'authentic task' for assessing student learning in environmental studies?",
    "options": {
      "A": "A multiple-choice quiz on definitions of pollution.",
      "B": "Designing an actionable neighborhood garbage disposal or recycling plan.",
      "C": "Writing down five sentences about trees from a textbook page.",
      "D": "Labeling a diagram of the water cycle from memory."
    },
    "correct_option": "B",
    "explanation": "An authentic task reflects real-world complexities and contexts, asking students to apply their knowledge creatively to address actual scenarios, rather than reproducing rote test metrics."
  },
  {
    "q_no": 19,
    "question": "The concept of 'Zone of Proximal Development' (ZPD) indicates the area:",
    "options": {
      "A": "Where a child cannot learn even with extensive expert support.",
      "B": "Between what a learner can do independently and what they can do with assistance.",
      "C": "Where intellectual developmental slowing occurs permanently.",
      "D": "Exclusive to solitary reflex conditioning."
    },
    "correct_option": "B",
    "explanation": "ZPD represents the golden learning zone: tasks that a child cannot complete alone yet can master when given targeted, structured guidance from an expert peer or instructor."
  },
  {
    "q_no": 20,
    "question": "A teacher treats intelligence as a static, fixed trait fixed at birth. This belief can lead to:",
    "options": {
      "A": "A growth mindset in students.",
      "B": "Higher expectations for lower-performing groups.",
      "C": "A fixed mindset that discourages effort and learning resilience.",
      "D": "More activity-centered lesson planning."
    },
    "correct_option": "C",
    "explanation": "Viewing intelligence as a fixed trait (Entity theory) fosters a fixed mindset. Students believe effort is useless if talent is predetermined, leading to low academic resilience when facing hurdles."
  },
  {
    "q_no": 21,
    "question": "In a multilingual country like India, a teacher should view the native languages spoken by children as:",
    "options": {
      "A": "A barrier or asset deficit to teaching English.",
      "B": "An administrative nuisance to be suppressed in school.",
      "C": "A rich resource for classroom instruction and language mapping.",
      "D": "A symptom of speech deficiency."
    },
    "correct_option": "C",
    "explanation": "National educational mandates (like NEP) highlight multilingualism as a cognitive and socio-cultural asset. Children's home languages should be used as pedagogical resources."
  },
  {
    "q_no": 22,
    "question": "Formative assessment is fundamentally designed to:",
    "options": {
      "A": "Grade and classify students into distinct sections.",
      "B": "Provide ongoing feedback to optimize teaching and learning paths.",
      "C": "Rank students for district awards at the close of an academic cycle.",
      "D": "Determine pass/fail metrics on report cards."
    },
    "correct_option": "B",
    "explanation": "Formative assessment is 'assessment for learning.' It occurs dynamically during the instruction period to inform both the teacher and learner on changes needed to optimize current comprehension."
  },
  {
    "q_no": 23,
    "question": "According to the Cephalocaudal principle of development, growth proceeds from:",
    "options": {
      "A": "Head to toe",
      "B": "Center to periphery",
      "C": "General to specific",
      "D": "Simple to complex"
    },
    "correct_option": "A",
    "explanation": "The Cephalocaudal principle states that biological growth and developmental control follow a head-to-toe pattern. A child gains control of their neck and upper upper chest before coordinating legs and walking."
  },
  {
    "q_no": 24,
    "question": "Which of the following practices promotes meaningful learning in classrooms?",
    "options": {
      "A": "Imposing uniform, rigid punishment systems.",
      "B": "Cooperative learning environments and linking concepts to real life.",
      "C": "Continuous comparative analysis of student marks on notice boards.",
      "D": "Exclusive reliance on teacher-led lecture methodology."
    },
    "correct_option": "B",
    "explanation": "Meaningful learning occurs when new concepts are systematically linked to contextual, real-world schemas, driven further by collective discussion and cooperative problem-solving."
  },
  {
    "q_no": 25,
    "question": "A student who exhibits extreme restlessness, struggles to pay attention for more than a few minutes, and acts impulsively may have:",
    "options": {
      "A": "Dyscalculia",
      "B": "Autism Spectrum Disorder",
      "C": "Attention Deficit Hyperactivity Disorder (ADHD)",
      "D": "Visual Impairment"
    },
    "correct_option": "C",
    "explanation": "ADHD is characterized by persistent patterns of inattention, hyperactivity, and impulsivity that interfere significantly with academic performance, executive functioning, and developmental tasks."
  }
]

def generate_sql():
    sql = "USE next_gen_db;\n\n"
    
    # 1. CTET category
    category_id = str(uuid.uuid4())
    sql += f"""
INSERT INTO exam_categories (id, name, description, icon) 
SELECT '{category_id}', 'CTET', 'Central Teacher Eligibility Test', '📚'
FROM DUAL
WHERE NOT EXISTS (SELECT id FROM exam_categories WHERE name = 'CTET');
"""

    # 2. CDP subject
    subject_id = str(uuid.uuid4())
    sql += f"""
SET @cat_id = (SELECT id FROM exam_categories WHERE name = 'CTET' LIMIT 1);
INSERT INTO subjects (id, category_id, name)
SELECT '{subject_id}', @cat_id, 'Child Development and Pedagogy'
FROM DUAL
WHERE NOT EXISTS (SELECT id FROM subjects WHERE name = 'Child Development and Pedagogy' AND category_id = @cat_id);
SET @subj_id = (SELECT id FROM subjects WHERE name = 'Child Development and Pedagogy' AND category_id = @cat_id LIMIT 1);
"""

    # 3. Questions
    question_ids = []
    sql += "\n-- Insert Questions\n"
    for item in ctet_data:
        q_id = str(uuid.uuid4())
        question_ids.append(q_id)
        escaped_q = item['question'].replace("'", "''")
        escaped_opts = json.dumps(item['options']).replace("'", "''")
        escaped_expl = item['explanation'].replace("'", "''")
        
        sql += f"""
INSERT INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, marks, negative_marks)
VALUES ('{q_id}', @cat_id, @subj_id, '{escaped_q}', '{escaped_opts}', '{item['correct_option']}', '{escaped_expl}', 1.00, 0.00);
"""

    # 4. Model Set
    modelset_id = str(uuid.uuid4())
    escaped_q_ids = json.dumps(question_ids).replace("'", "''")
    sql += f"""
-- Insert Model Set
INSERT INTO model_sets (id, title, description, category_id, question_ids, time_limit_minutes, total_marks, status)
VALUES ('{modelset_id}', 'CTET CDP 25-Question Mock Set', 'A comprehensive 25-questions mock model MCQ set covering CTET CDP syllabus.', @cat_id, '{escaped_q_ids}', 30, 25.00, 'published');
"""

    with open('insert_ctet.sql', 'w') as f:
        f.write(sql)
    print("Generated insert_ctet.sql")

if __name__ == '__main__':
    generate_sql()
