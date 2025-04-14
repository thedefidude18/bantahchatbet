import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import MobileFooterNav from '../components/MobileFooterNav';
import LoadingSpinner from '../components/LoadingSpinner';

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
  admin: {
    name: string;
    avatar_url: string;
  };
  image_url?: string;
}

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();

    // Subscribe to real-time changes
    const storiesSubscription = supabase
      .channel('stories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      storiesSubscription.unsubscribe();
    };
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          admin:admin_id (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <PageHeader title="Stories" />
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No stories available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <div 
                  key={story.id}
                  className="bg-white rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-md"
                >
                  {story.image_url && (
                    <img 
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-4">{story.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <img 
                        src={story.admin.avatar_url || '/avatar.svg'}
                        alt={story.admin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{story.admin.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileFooterNav />
    </div>
  );
};

export default Stories;