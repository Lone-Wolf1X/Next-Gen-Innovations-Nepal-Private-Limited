'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { auth } from '@/lib/firebase';
import '../Courses.css';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [modelSets, setModelSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cData = await fetchAPI(`vacancies.php?action=get&id=${courseId}`);
        if (!cData || cData.error) {
          alert('Course not found or access denied');
          router.push('/courses');
          return;
        }
        setCourse(cData);

        const sets = await fetchAPI(`model_sets.php?action=getPublished&vacancyId=${courseId}`);
        setModelSets(sets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadData();
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="courses-container">
        <div className="skeleton" style={{ height: '60px', marginBottom: '24px' }}></div>
        <div className="skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
            {course.category_name}
          </div>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
        </div>
        <Link href="/courses" className="btn btn-outline">
          ← Back
        </Link>
      </div>

      <div className="card card-padded">
        <h3 style={{ marginBottom: '16px' }}>Available Mock Tests</h3>
        
        {modelSets.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <p className="empty-desc">No mock tests published yet for this course.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modelSets.map((set) => (
              <div 
                key={set.id} 
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  borderRadius: '12px'
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{set.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {set.totalQuestions || 0} Questions • {set.timeLimitMinutes || 60} Minutes
                  </div>
                </div>
                <Link href={`/test/${set.id}`} className="btn btn-primary">
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
