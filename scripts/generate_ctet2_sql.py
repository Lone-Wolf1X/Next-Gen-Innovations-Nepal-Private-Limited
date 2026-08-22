import json
import uuid

ctet_data = [
  {
    "q_no": 1,
    "question": "According to Jean Piaget, at which stage of cognitive development does a child begin to think logically about concrete events?",
    "options": {
      "A": "Sensorimotor stage",
      "B": "Pre-operational stage",
      "C": "Concrete operational stage",
      "D": "Formal operational stage"
    },
    "correct_option": "C",
    "explanation": "During the Concrete Operational Stage (7-11 years), children develop the capacity to think logically, but only about concrete, tangible objects and real-world events that they can perceive directly."
  },
  {
    "q_no": 2,
    "question": "According to Lev Vygotsky, the concept of 'Zone of Proximal Development' (ZPD) refers to:",
    "options": {
      "A": "The point at which a child can perform a task completely independently.",
      "B": "The distance between what a learner can do independently and what they can do with expert guidance.",
      "C": "The fixed intelligence quotient (IQ) score measured by standard tests.",
      "D": "The genetic limitation of developmental potential."
    },
    "correct_option": "B",
    "explanation": "ZPD is the dynamic learning zone representing tasks that are too difficult for a child to master alone but can be learned with the help and scaffolding of a More Knowledgeable Other (MKO)."
  },
  {
    "q_no": 3,
    "question": "In Kohlberg's theory of moral development, a child whose moral reasoning is based on avoiding punishment and obeying authority is at the:",
    "options": {
      "A": "Pre-conventional morality level",
      "B": "Conventional morality level",
      "C": "Post-conventional morality level",
      "D": "Social-contract orientation level"
    },
    "correct_option": "A",
    "explanation": "The first level of Kohlberg's theory is Pre-conventional morality, where the first stage is obedience and punishment orientation. Rules are viewed as fixed and absolute strictly to avoid negative physical consequences."
  },
  {
    "q_no": 4,
    "question": "A child consistently reads 'saw' as 'was' and confuses letters like 'b' and 'd'. These symptoms are characteristic of which learning disability?",
    "options": {
      "A": "Dysgraphia",
      "B": "Dyslexia",
      "C": "Dyscalculia",
      "D": "ADHD"
    },
    "correct_option": "B",
    "explanation": "Dyslexia is a specific language-based learning disability that primary impairs a person's ability to read, decode words fluently, and recognize letter patterns accurately."
  },
  {
    "q_no": 5,
    "question": "The fundamental goal of 'Inclusive Education' in an Indian school setup is to:",
    "options": {
      "A": "Establish separate special schools for children with physical challenges.",
      "B": "Educate all children together in the regular classroom regardless of physical, cognitive, or socio-economic differences.",
      "C": "Focus exclusively on regularizing curriculum for gifted and high-performing students.",
      "D": "Enforce strict uniform lecturing standards across all districts."
    },
    "correct_option": "B",
    "explanation": "Inclusive education means restructuring the educational framework so that all children, including those with special needs (CWSN) and diverse backgrounds, study together equitably in regular classrooms."
  },
  {
    "q_no": 6,
    "question": "John Dewey, the father of Progressive Education, emphasized that schools should be a reflection of society and learning should happen through:",
    "options": {
      "A": "Passive listening and strict structural discipline.",
      "B": "Rote memorization of prescribed standard textbooks.",
      "C": "Learning by doing, hands-on activities, and collaborative problem-solving.",
      "D": "Frequent teacher-led standardized testing."
    },
    "correct_option": "C",
    "explanation": "Progressive education rejects passive instruction. It prioritizes experiential learning ('learning by doing'), critical thinking, and social collaboration inside the classroom ecosystem."
  },
  {
    "q_no": 7,
    "question": "What is the primary objective of Formative Assessment conducted during the instructional process?",
    "options": {
      "A": "To rank and classify students at the end of the academic year.",
      "B": "To provide ongoing, diagnostic feedback to improve both teaching methodologies and student learning.",
      "C": "To award grades and terminal pass/fail certificates.",
      "D": "To accelerate syllabus completion under administrative time constraints."
    },
    "correct_option": "B",
    "explanation": "Formative assessment is 'assessment for learning.' It occurs concurrently with instruction to diagnose learning gaps and adjust active teaching strategies to optimize understanding dynamically."
  },
  {
    "q_no": 8,
    "question": "Child-Centered Pedagogy means giving primacy to:",
    "options": {
      "A": "The complete authoritative control of the classroom by the teacher.",
      "B": "Children's experiences, voices, interests, and active participation.",
      "C": "Mechanical writing assignments and copying text from the board.",
      "D": "Segregating children based on their initial IQ levels."
    },
    "correct_option": "B",
    "explanation": "Child-centered pedagogy keeps the learner at the focus, respecting individual differences, innate capacities, and utilizing their active participation as the engine of learning."
  },
  {
    "q_no": 9,
    "question": "Which of the following is considered the primary agency of socialization for a child?",
    "options": {
      "A": "School and educational institutions",
      "B": "Mass media and internet portals",
      "C": "Family and immediate neighborhood",
      "D": "Religious and political organizations"
    },
    "correct_option": "C",
    "explanation": "The family is the primary agency of socialization. It is the initial social circle where a child learns foundational behaviors, values, language, and cultural norms from infancy."
  },
  {
    "q_no": 10,
    "question": "During the Pre-operational stage, a child focuses on only one aspect of a situation while neglecting others. Piaget termed this cognitive limitation as:",
    "options": {
      "A": "Centration",
      "B": "Object Permanence",
      "C": "Reversibility",
      "D": "Conservation"
    },
    "correct_option": "A",
    "explanation": "Centration is the tendency to focus on one salient feature of an object or problem while excluding other relevant elements. This prevents children in the pre-operational stage from understanding conservation."
  },
  {
    "q_no": 11,
    "question": "Which of the following scenarios is an example of Intrinsic Motivation?",
    "options": {
      "A": "Studying hard to win a cash prize from parents.",
      "B": "Completing homework out of fear of getting punished by the teacher.",
      "C": "Reading a science textbook out of pure curiosity and personal interest in the topic.",
      "D": "Participating in a race solely to show off athletic superiority to peers."
    },
    "correct_option": "C",
    "explanation": "Intrinsic motivation originates from within an individual. The activity itself is inherently rewarding, satisfying, or joyful, and does not require external incentives or pressure."
  },
  {
    "q_no": 12,
    "question": "According to Howard Gardner's theory of Multiple Intelligences, architects and sculptors generally possess high levels of:",
    "options": {
      "A": "Logical-mathematical Intelligence",
      "B": "Visual-spatial Intelligence",
      "C": "Bodily-kinesthetic Intelligence",
      "D": "Interpersonal Intelligence"
    },
    "correct_option": "B",
    "explanation": "Visual-spatial intelligence involves the capacity to think in images, orient objects accurately in 3D mental schemas, and recreate spatial arrangements effectively."
  },
  {
    "q_no": 13,
    "question": "In Piaget's theory, the process of modifying existing cognitive structures (schemas) or creating new ones because new info conflicts with old ideas is called:",
    "options": {
      "A": "Assimilation",
      "B": "Accommodation",
      "C": "Objectification",
      "D": "Egocentrism"
    },
    "correct_option": "B",
    "explanation": "Accommodation involves modifying internal mental structures or creating entirely new ones when new environmental information cannot be cleanly assimilated into pre-existing schemas."
  },
  {
    "q_no": 14,
    "question": "The ongoing nature-nurture debate in developmental psychology centers around the relative contribution of:",
    "options": {
      "A": "Home environment versus school environment.",
      "B": "Heredity (genetic makeup) and Environment (experiential context).",
      "C": "Physical nutrition versus mental stimulation.",
      "D": "Maternal care versus paternal interaction."
    },
    "correct_option": "B",
    "explanation": "Nature denotes biological heredity, genetic inheritance, and maturation. Nurture signifies environmental influences, cultural context, upbringing, and learning experiences."
  },
  {
    "q_no": 15,
    "question": "A major point of divergence between the cognitive theories of Jean Piaget and Lev Vygotsky lies in their view of:",
    "options": {
      "A": "Whether children are passive or active learners.",
      "B": "The functional relationship between Language and Thought.",
      "C": "The fundamental existence of cognitive development altogether.",
      "D": "The value of observational learning mechanisms."
    },
    "correct_option": "B",
    "explanation": "Piaget argued that thought precedes language and that language is a tool for expressing egocentric thought. Vygotsky argued that language and thought initially develop separately and merge around age three, with language driving cognitive internalization."
  },
  {
    "q_no": 16,
    "question": "An educator assigns domestic tasks like decoration to girls and technical tasks like computer maintenance to boys. This instructional bias reflects:",
    "options": {
      "A": "Gender Equity",
      "B": "Gender Stereotyping",
      "C": "Gender Constancy",
      "D": "Gender Empowerment"
    },
    "correct_option": "B",
    "explanation": "Assigning specific behaviors, expectations, or limitations to individuals based purely on historical gender roles rather than individual capabilities constitutes gender stereotyping."
  },
  {
    "q_no": 17,
    "question": "In Continuous and Comprehensive Evaluation (CCE), the term 'Comprehensive' specifically implies the assessment of:",
    "options": {
      "A": "Only academic (scholastic) subjects via pen-and-paper tests.",
      "B": "Both scholastic (academic) and co-scholastic (holistic/co-curricular) domains of a child's development.",
      "C": "Extensive cognitive memorization traits evaluated weekly.",
      "D": "Strict non-verbal motor milestones during early childhood."
    },
    "correct_option": "B",
    "explanation": "Comprehensive evaluation focuses on the holistic development of the child, integrating academic achievements (scholastic) alongside behavioral values, life skills, physical health, and arts (co-scholastic)."
  },
  {
    "q_no": 18,
    "question": "Who proposed the 'Two-Factor Theory of Intelligence' consisting of a general factor ('g') and specific factors ('s')?",
    "options": {
      "A": "Howard Gardner",
      "B": "Charles Spearman",
      "C": "Louis Thurstone",
      "D": "Robert Sternberg"
    },
    "correct_option": "B",
    "explanation": "Charles Spearman introduced the Two-Factor Theory of Intelligence in 1904, identifying a general intellectual capacity ('g factor') underlying all mental actions and task-specific traits ('s factors')."
  },
  {
    "q_no": 19,
    "question": "The 'Operant Conditioning' theory of learning, which posits that behavior is shaped by its consequences (reinforcement and punishment), was developed by:",
    "options": {
      "A": "Ivan Pavlov",
      "B": "B.F. Skinner",
      "C": "Edward Thorndike",
      "D": "Albert Bandura"
    },
    "correct_option": "B",
    "explanation": "B.F. Skinner developed Operant Conditioning, demonstrating that behavioral frequency changes depending on positive reinforcement, negative reinforcement, or punitive outcomes following the actions."
  },
  {
    "q_no": 20,
    "question": "A student struggles with mathematical operations, recognizing numerical symbols, and calculating values. The student is likely experiencing:",
    "options": {
      "A": "Dyslexia",
      "B": "Dyscalculia",
      "C": "Dysgraphia",
      "D": "Aphasia"
    },
    "correct_option": "B",
    "explanation": "Dyscalculia is a neurological learning disability that severely limits an individual's capacity to comprehend numbers, learn mathematical operations, perform computations, and grasp arithmetic patterns."
  },
  {
    "q_no": 21,
    "question": "Which of the following evaluation strategies aligns best with Child-Centered Pedagogy?",
    "options": {
      "A": "A single terminal board exam evaluating memorization.",
      "B": "Continuous and qualitative assessments like student portfolios, self-assessments, and projects.",
      "C": "Rigid multiple-choice testing applied uniformly at the start of a semester.",
      "D": "Comparing and displaying student rank lists publicly."
    },
    "correct_option": "B",
    "explanation": "Child-centered pedagogy requires multidimensional, non-threatening evaluation techniques like portfolios and peer reviews that capture progress organically rather than through a static high-stakes exam."
  },
  {
    "q_no": 22,
    "question": "In an Inclusive Classroom, which of the following practices should a teacher strictly avoid?",
    "options": {
      "A": "Implementing Individualized Education Programs (IEPs) for learners.",
      "B": "Segregating and placing children with disabilities in separate rows or sections.",
      "C": "Utilizing diverse audio-visual instructional aids.",
      "D": "Modifying physical infrastructure to ensure barrier-free access."
    },
    "correct_option": "B",
    "explanation": "Inclusive principles demand full social integration. Isolating or segregating children based on their differences creates psychological barriers and violates the fundamental ethics of inclusive education."
  },
  {
    "q_no": 23,
    "question": "Which statement regarding the principles of human growth and development is factually accurate?",
    "options": {
      "A": "Development is a discontinuous, random sequence of events.",
      "B": "Development is a continuous lifelong process that runs from conception to death.",
      "C": "Development proceeds at a totally identical rate for every individual child.",
      "D": "Development is solely governed by environmental aspects with zero hereditary influence."
    },
    "correct_option": "B",
    "explanation": "Development is a predictable, orderly, and continuous process that unfolds across the human lifespan, encompassing progressive physical, mental, and social transformations."
  },
  {
    "q_no": 24,
    "question": "According to Lev Vygotsky, when children talk aloud to themselves to guide and regulate their own cognitive actions, this speech is called:",
    "options": {
      "A": "Social Speech",
      "B": "Private Speech",
      "C": "Egocentric Speech",
      "D": "Inner Speech"
    },
    "correct_option": "B",
    "explanation": "Vygotsky termed this 'Private Speech.' He viewed it as an essential self-regulatory cognitive tool used by children to plan, guide, and monitor their active problem-solving behaviors."
  },
  {
    "q_no": 25,
    "question": "The primary focus of Summative Assessment (Yogratmak Mulyankan) is to:",
    "options": {
      "A": "Provide instant formative guidance while a concept is being introduced.",
      "B": "Evaluate learning outcomes, judge student competency, and assign grades at the end of an instructional unit.",
      "C": "Modify regular daily lesson plans based on student mood.",
      "D": "Identify learning disabilities prior to school enrollment."
    },
    "correct_option": "B",
    "explanation": "Summative assessment is 'assessment of learning.' It occurs at the conclusion of a specified instructional block (e.g., semester finals) to evaluate cumulative achievement benchmarks and certify performance grades."
  }
]

def generate_sql():
    sql = "USE next_gen_db;\n\n"
    
    # We assume CTET category and CDP subject already exist from earlier.
    sql += f"""
SET @cat_id = (SELECT id FROM exam_categories WHERE name = 'CTET' LIMIT 1);
SET @subj_id = (SELECT id FROM subjects WHERE name = 'Child Development and Pedagogy' AND category_id = @cat_id LIMIT 1);
SET @vac_id = (SELECT id FROM vacancies WHERE title = 'CTET Complete Preparation' AND category_id = @cat_id LIMIT 1);
"""

    # Questions
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

    # Model Set 2
    modelset_id = str(uuid.uuid4())
    escaped_q_ids = json.dumps(question_ids).replace("'", "''")
    sql += f"""
-- Insert Model Set 2
INSERT INTO model_sets (id, title, description, category_id, vacancy_id, question_ids, time_limit_minutes, total_marks, status)
VALUES ('{modelset_id}', 'CTET CDP Mock Set 2 (New)', 'Another comprehensive 25-questions mock model MCQ set covering CTET CDP syllabus.', @cat_id, @vac_id, '{escaped_q_ids}', 30, 25.00, 'published');
"""

    with open('insert_ctet2.sql', 'w') as f:
        f.write(sql)
    print("Generated insert_ctet2.sql")

if __name__ == '__main__':
    generate_sql()
