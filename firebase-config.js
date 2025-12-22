<!-- Firebase Config & Integration -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>

<script>
    // ==========================================
    // FIREBASE CONFIG - UPDATE THIS!
    // ==========================================
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const storage = firebase.storage();
    const db = firebase.firestore();

    // ==========================================
    // FIREBASE UPLOAD FUNCTIONS
    // ==========================================
    async function handlePhotoUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            try {
                const fileName = Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '.' + file.name.split('.').pop();
                const storageRef = storage.ref('uploads/' + fileName);
                
                // Upload file
                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                console.log(`✅ Uploaded: ${fileName}`);
                
                // Save metadata to Firestore
                await db.collection('photos').add({
                    filename: fileName,
                    url: downloadURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    size: file.size
                });
                
                // Reload photos
                loadUploadedPhotos();
            } catch (error) {
                console.error('Upload error:', error);
                alert('❌ Upload failed: ' + error.message);
            }
        }
        
        // Clear input
        event.target.value = '';
    }

    async function loadUploadedPhotos() {
        try {
            const snapshot = await db.collection('photos').orderBy('timestamp', 'desc').get();
            uploadedPhotos = [];
            const container = document.getElementById('photo-thumbnails');
            container.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                uploadedPhotos.push(data.url);
                
                const img = document.createElement('img');
                img.src = data.url;
                img.title = `${data.filename} (click to remove)`;
                img.onclick = () => deletePhoto(doc.id);
                container.appendChild(img);
            });
            
            console.log(`✅ Loaded ${uploadedPhotos.length} photos from Firebase`);
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }

    async function deletePhoto(docId) {
        if (confirm('Remove photo?')) {
            try {
                // Get file name and delete from storage
                const doc = await db.collection('photos').doc(docId).get();
                const filename = doc.data().filename;
                
                await storage.ref('uploads/' + filename).delete();
                await db.collection('photos').doc(docId).delete();
                
                console.log(`✅ Deleted photo`);
                loadUploadedPhotos();
            } catch (error) {
                console.error('Delete error:', error);
                alert('❌ Delete failed: ' + error.message);
            }
        }
    }

    // ==========================================
    // YOUTUBE CONFIG PERSISTENCE
    // ==========================================
    async function saveYoutubeToFirestore() {
        try {
            const link = document.getElementById('youtube-link').value;
            await db.collection('config').doc('youtube').set({
                link: link,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ YouTube link saved to Firebase');
        } catch (error) {
            console.error('Failed to save YouTube link:', error);
            // Fallback to localStorage
            localStorage.setItem('youtubeLink', document.getElementById('youtube-link').value);
        }
    }

    async function loadYoutubeFromFirestore() {
        try {
            const doc = await db.collection('config').doc('youtube').get();
            if (doc.exists) {
                document.getElementById('youtube-link').value = doc.data().link;
                console.log('✅ YouTube link loaded from Firebase');
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('youtubeLink');
                if (stored) {
                    document.getElementById('youtube-link').value = stored;
                }
            }
        } catch (error) {
            console.error('Failed to load YouTube link:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('youtubeLink');
            if (stored) {
                document.getElementById('youtube-link').value = stored;
            }
        }
    }

    function updateMusic() {
        const link = document.getElementById('youtube-link').value;
        const videoId = extractYoutubeId(link);
        if (videoId) {
            currentYoutubeId = videoId;
            saveYoutubeToFirestore(); // Save to Firebase
            console.log('Music updated:', videoId);
            alert('✅ Music saved!');
        } else {
            alert('❌ Invalid YouTube link!');
        }
    }

    // Load config on startup
    document.addEventListener('DOMContentLoaded', () => {
        loadYoutubeFromFirestore();
        loadUploadedPhotos();
    });
</script>
