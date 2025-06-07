import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import PhotoModal from './PhotoModal';

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from('photos').select('*').order('tanggal', { ascending: false });
      setPhotos(data);
    };
    fetchPhotos();
  }, []);

  return (
    <div className="gallery">
      {photos.map(photo => (
        <img key={photo.id} src={photo.url} alt="foto" onClick={() => setSelected(photo)} />
      ))}
      {selected && <PhotoModal photo={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default Gallery;
