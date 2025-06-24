import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WriteUpsPage.css';
import ContactSection from './ContactSection';
import api from './api';

interface Writeup {
  id: number;
  title: string;
  author_name: string;
  content: string;
  likes: number;
  is_public: boolean;
  created_at: string;
}

const WriteUpsPage: React.FC = () => {
  const [myClaims, setMyClaims] = useState<Writeup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const myClaimsContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const claimsRes = await api.get('/api/writeups/myclaims');
      setMyClaims(claimsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredMyClaims = myClaims.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scroll = (offset: number, ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <>
      <div className="hero-section">
        <div style={{ textAlign: 'left' }}>
          <button className="add-button" onClick={() => setShowEditor(true)}>+ Add My Bottle</button>
          <button className="add-button" onClick={() => navigate("/game")}>Go to Sea</button>
        </div>
        <h1>Bottles Dashboard</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="Search my claimed bottles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* My Claimed Bottles */}
      <section className="articles-section">
        <h2 className="section-title">My Claimed Bottles</h2>
        {filteredMyClaims.length === 0 ? (
          <p className="no-writeups-msg">No Claimed Bottles Found...</p>
        ) : (
          <div className="scroll-wrapper">
            <button className="scroll-button left" onClick={() => scroll(-400, myClaimsContainerRef)}>◀</button>
            <div className="articles-container" ref={myClaimsContainerRef}>
              {filteredMyClaims.map(w => (
                <div key={w.id} className="article-card">
                  <h3>{w.title}</h3>
                  <p className="meta">By {w.author_name}</p>
                  <p className="engagement">❤️ {w.likes}</p>
                  <button onClick={() => setSelectedWriteup(w)}>Open</button>
                </div>
              ))}
            </div>
            <button className="scroll-button right" onClick={() => scroll(400, myClaimsContainerRef)}>▶</button>
          </div>
        )}
      </section>

      {showEditor && <WriteUpEditor onClose={() => { setShowEditor(false); fetchAllData(); }} />}
      {selectedWriteup && (
        <WriteUpModal writeup={selectedWriteup} onClose={() => setSelectedWriteup(null)} refresh={fetchAllData} />
      )}
      <ContactSection />
    </>
  );
};

export default WriteUpsPage;

interface WriteUpEditorProps {
  onClose: () => void;
}

const WriteUpEditor: React.FC<WriteUpEditorProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/writeups', { title, content, is_public: isPublic });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error adding writeup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <h2>Add New Bottle</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title" value={title} required onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Write your message here..." rows={10} value={content} required onChange={e => setContent(e.target.value)} />
          <label>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            Make Public
          </label>
          <div className="editor-buttons">
            <button type="submit" disabled={loading}>{loading ? 'Reaching Sea...' : 'Throw at Sea'}</button>
            <button type="button" onClick={onClose}>Forget it</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface WriteUpModalProps {
  writeup: Writeup;
  onClose: () => void;
  refresh: () => void;
}

const WriteUpModal: React.FC<WriteUpModalProps> = ({ writeup, onClose, refresh }) => {
  const [likes, setLikes] = useState(writeup.likes);
  const [liked, setLiked] = useState(false);

  const onUnclaim = async () => {
    try {
      await api.post(`/api/writeups/unclaim/${writeup.id}`);
      alert('Writeup thrown back to the sea!');
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error unclaiming writeup');
    }
  };

  const onDelete = async () => {
    if (!confirm('Are you sure you want to delete this writeup forever?')) return;
    try {
      await api.delete(`/api/writeups/${writeup.id}`);
      alert('Writeup deleted!');
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error deleting writeup');
    }
  };

  const toggleLike = async () => {
    try {
      const url = `/api/writeups/${writeup.id}/${liked ? 'unlike' : 'like'}`;
      const response = await api.post(url);
      setLikes(response.data.likes);
      setLiked(!liked);
      refresh();
    } catch (err) {
      console.error(err);
      alert('Error updating like');
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <h2>{writeup.title}</h2>
        <p><strong>Author:</strong> {writeup.author_name}</p>
        <p><strong>Created At:</strong> {new Date(writeup.created_at).toLocaleString()}</p>
        <hr />
        <div style={{ whiteSpace: 'pre-wrap' }}>{writeup.content}</div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={toggleLike}>{liked ? '❤️' : '🩶'}{likes} Likes</button>
          <button style={{ marginLeft: '20px' }} onClick={onUnclaim}>Throw at Sea 🌊</button>
          <button style={{ marginLeft: '20px' }} onClick={onDelete}>Sink Forever 💀</button>
          <button style={{ marginLeft: '20px' }} onClick={onClose}>Let it be</button>
        </div>
      </div>
    </div>
  );
};
