const SUPABASE_URL = 'https://qepzcgmdkxvnhfdydhyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcHpjZ21ka3h2bmhmZHlkaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MDE5MTcsImV4cCI6MjA4MjQ3NzkxN30.XXdoUtf69AncZjN8tilpdjrjVg6lmG7qf00ieGbcdU0'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== AUTH MODE =====
let authMode = 'signin'; // 'signin' or 'signup'

function switchTab(mode) {
    authMode = mode;
    document.getElementById('tab-signin').classList.toggle('active', mode === 'signin');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    document.getElementById('btn-text').innerText = mode === 'signin' ? 'Sign In' : 'Create Account';
    document.getElementById('login-msg').innerText = '';
}

function showLoginMsg(msg, isError = true) {
    const el = document.getElementById('login-msg');
    el.innerText = msg;
    el.className = isError ? 'login-msg error' : 'login-msg success';
}

function setLoading(loading) {
    const btn = document.getElementById('login-btn');
    const arrow = document.getElementById('btn-arrow');
    const spinner = document.getElementById('btn-spinner');
    btn.disabled = loading;
    arrow.style.display = loading ? 'none' : '';
    spinner.style.display = loading ? 'inline-block' : 'none';
    if (loading) btn.classList.add('loading');
    else btn.classList.remove('loading');
}

// ===== LOGIN / SIGNUP =====
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showLoginMsg('Please enter your email and password.');
        return;
    }

    if (password.length < 6) {
        showLoginMsg('Password must be at least 6 characters.');
        return;
    }

    setLoading(true);

    if (authMode === 'signin') {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            showLoginMsg('Invalid email or password. Try again or use the test account.');
        } else {
            showLoginMsg('Welcome back! Signing in...', false);
            setTimeout(() => checkUser(), 500);
        }
    } else {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        setLoading(false);
        if (error) {
            if (error.message.toLowerCase().includes('rate limit')) {
                showLoginMsg('Sign up limit reached (Free Tier). Please use the test account above.', true);
            } else {
                showLoginMsg('Error: ' + error.message);
            }
        } else {
            showLoginMsg('🎉 Account created! Check your email to confirm, then sign in.', false);
            // Switch to sign-in tab after successful signup
            setTimeout(() => switchTab('signin'), 2000);
        }
    }
}

// ===== SESSION =====
async function handleLogout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        // Show user email in header
        const emailEl = document.getElementById('user-email');
        if (emailEl) emailEl.innerText = user.email;
        loadFiles(); 
    }
}

checkUser();


// ===== FILE UPLOAD (Drag & Drop) =====
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(); 
        }
    });

    fileInput.addEventListener('change', () => {
        handleFileUpload();
    });
}

async function handleFileUpload() {
    const file = fileInput.files[0];
    const status = document.getElementById('upload-status');
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!file) return;

    if (!user) {
        status.innerText = "❌ You must be signed in to upload files.";
        status.className = 'upload-status error';
        return;
    }

    status.innerText = `Uploading ${file.name}...`;
    status.className = 'upload-status uploading';
    const fileName = `${Date.now()}_${file.name}`;
    
    const { error } = await supabaseClient.storage.from('uploads').upload(fileName, file);

    if (error) {
        status.innerText = "❌ " + error.message;
        status.className = 'upload-status error';
        return;
    }

    const { data: { publicUrl } } = supabaseClient.storage.from('uploads').getPublicUrl(fileName);

    await supabaseClient.from('files').insert([
        { name: file.name, url: publicUrl, owner_email: user.email }
    ]);

    status.innerText = "✅ Upload Complete!";
    status.className = 'upload-status success';
    setTimeout(() => { status.innerText = ""; status.className = ''; }, 3000); 
    loadFiles();
}


// ===== FILE LIST =====
async function loadFiles() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return; // Silent return if not logged in

    console.log("Loading files...");
    const listContainer = document.getElementById('file-list');
    listContainer.innerHTML = "<div class='loading-files'><i class='fas fa-spinner fa-spin'></i> Loading files...</div>";
    
    const { data: files, error } = await supabaseClient
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        listContainer.innerHTML = "<div class='empty-state'><i class='fas fa-circle-exclamation' style='color:#fca5a5;'></i><p>Error loading files.</p></div>";
        return;
    }

    listContainer.innerHTML = "";
    
    if (files.length === 0) {
        listContainer.innerHTML = "<div class='empty-state'><i class='fas fa-folder-open'></i><p>No files yet. Upload your first file!</p></div>";
        return;
    }

    files.forEach(file => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isDoc = file.name.match(/\.(docx|doc|pdf)$/i);
        
        let iconClass = 'fas fa-file';
        if (isImage) iconClass = 'fas fa-image';
        if (isDoc) iconClass = 'fas fa-file-pdf';

        let buttonsHtml = '';
        const downloadBtn = `<a href="${file.url}" target="_blank" class="file-action-btn download"><i class="fas fa-download"></i></a>`;

        if (isImage) {
            buttonsHtml = `<button class="file-action-btn view" onclick="openLightbox('${file.url}', 'image')"><i class="fas fa-eye"></i></button>` + downloadBtn;
        } 
        else if (isDoc) {
            buttonsHtml = `<button class="file-action-btn view" onclick="openLightbox('${file.url}', 'doc')"><i class="fas fa-eye"></i></button>` + downloadBtn;
        } 
        else {
            buttonsHtml = downloadBtn;
        }

        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.innerHTML = `
            <div class="file-icon-badge"><i class="${iconClass}"></i></div>
            <span class="file-name">${file.name}</span>
            <div class="file-actions">
                ${buttonsHtml}
                <button onclick="deleteFile('${file.id}', '${file.name}')" class="file-action-btn delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        listContainer.appendChild(fileDiv);
    });
}

// ===== DELETE =====
async function deleteFile(rowId, fileName) {
    if (!confirm(`Delete "${fileName}"?`)) return;

    const { error } = await supabaseClient.from('files').delete().eq('id', rowId);
    if (error) alert("Error: " + error.message);
    else loadFiles();
}

// ===== LIGHTBOX =====
function openLightbox(url, type) {
    const lightbox = document.getElementById('lightbox');
    const imgElement = document.getElementById('lightbox-img');
    const frameElement = document.getElementById('lightbox-frame');

    imgElement.style.display = 'none';
    frameElement.style.display = 'none';

    if (type === 'image') {
        imgElement.src = url;
        imgElement.style.display = 'block';
    } 
    else if (type === 'doc') {
        frameElement.src = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        frameElement.style.display = 'block';
    }

    lightbox.classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}