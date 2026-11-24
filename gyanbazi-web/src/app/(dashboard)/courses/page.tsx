'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { auth } from '@/lib/firebase';
import './Courses.css';

interface Course {
  id: string;
  category_name: string;
  title: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      // Temporarily bypass auth wait for structural purposes.
      // In production, you'd wait for onAuthStateChanged
      try {
        const allCourses = await fetchAPI('vacancies.php?action=list');
        const enrollments = await fetchAPI('vacancies.php?action=myEnrollments');
        
        setCourses(allCourses || []);
        if (enrollments && Array.isArray(enrollments)) {
          setEnrolledIds(enrollments.map((e: any) => e.id));
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const enrollCourse = async (vacancyId: string) => {
    if (!confirm("Do you want to enroll in this course?")) return;
    try {
      const res = await fetchAPI('vacancies.php?action=enroll', 'POST', { vacancyId });
      if (res.success) {
        alert("Enrolled successfully!");
        setEnrolledIds(prev => [...prev, vacancyId]);
        window.location.href = `/courses/${vacancyId}`;
      } else {
        alert("Error: " + (res.error || "Could not enroll"));
      }
    } catch (e) {
      alert("Network error occurred.");
    }
  };

  return (
    <div className="courses-container">
      <div className="page-header">
        <h2>Exam Categories</h2>
        <p>Choose your target exam to begin</p>
      </div>

      {loading ? (
        <div className="course-grid">
          <div className="skeleton" style={{ height: '200px' }}></div>
          <div className="skeleton" style={{ height: '200px' }}></div>
          <div className="skeleton" style={{ height: '200px' }}></div>
        </div>
      ) : (
        <div className="course-grid">
          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No courses available</div>
              <div className="empty-desc">The admin is setting up courses. Please check back soon.</div>
            </div>
          ) : (
            courses.map(course => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div key={course.id} className="card card-padded course-card">
                  <div>
                    <div className="course-category">{course.category_name}</div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-desc">{course.description || 'Join this course to start your preparation.'}</p>
                  </div>
                  <div>
                    {isEnrolled ? (
                      <Link href={`/courses/${course.id}`} className="btn btn-outline" style={{ width: '100%' }}>
                        Go to Course
                      </Link>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => enrollCourse(course.id)}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
