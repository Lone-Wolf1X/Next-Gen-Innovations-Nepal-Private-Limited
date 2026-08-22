#!/bin/bash
scp seed_rbb_syllabus.sql root@161.118.189.212:/root/
ssh root@161.118.189.212 "mysql -u learner -p'LearnerPassword123!' learn < /root/seed_rbb_syllabus.sql"
