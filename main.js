class BlogApp {
    constructor() {
        this.currentEditCategoryId = null;
        this.currentEditArticleId = null;
        this.viewingArticleId = null;
        this.init();
    }

    init() {
        this.loadProfile();
        this.loadCategories();
        this.loadArticles();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e));

        document.getElementById('addCategoryBtn').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('updateCategoryBtn').addEventListener('click', () => this.updateCategory());

        document.getElementById('addArticleBtn').addEventListener('click', () => this.toggleArticleForm());
        document.getElementById('saveArticleBtn').addEventListener('click', () => this.saveArticle());
        document.getElementById('cancelArticleBtn').addEventListener('click', () => this.toggleArticleForm());

        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeModalBtn2').addEventListener('click', () => this.closeModal());
        document.getElementById('closeArticleModalBtn').addEventListener('click', () => this.closeArticleModal());
        document.getElementById('closeArticleModalBtn2').addEventListener('click', () => this.closeArticleModal());
        document.getElementById('editArticleBtn').addEventListener('click', () => this.editArticleFromModal());
        document.getElementById('deleteArticleBtn').addEventListener('click', () => this.deleteArticleFromModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });

        document.getElementById('articleModal').addEventListener('click', (e) => {
            if (e.target.id === 'articleModal') this.closeArticleModal();
        });
    }

    loadProfile() {
        const profile = this.getFromStorage('profile');
        if (profile) {
            document.getElementById('userName').value = profile.name || '';
            document.getElementById('userPosition').value = profile.position || '';
            document.getElementById('userCompany').value = profile.company || '';
            document.getElementById('userBio').value = profile.bio || '';
            if (profile.image) {
                document.getElementById('profileImage').src = profile.image;
            }
        }
    }

    saveProfile() {
        const profile = {
            name: document.getElementById('userName').value,
            position: document.getElementById('userPosition').value,
            company: document.getElementById('userCompany').value,
            bio: document.getElementById('userBio').value,
            image: document.getElementById('profileImage').src
        };
        this.saveToStorage('profile', profile);
        this.showNotification('个人信息保存成功！', 'success');
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('profileImage').src = event.target.result;
                const profile = this.getFromStorage('profile') || {};
                profile.image = event.target.result;
                this.saveToStorage('profile', profile);
                this.showNotification('头像上传成功！', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    loadCategories() {
        const categories = this.getFromStorage('categories') || [];
        const container = document.getElementById('categoriesList');

        if (categories.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📂</div><p>暂无分类</p></div>';
            return;
        }

        container.innerHTML = categories.map(cat => `
            <div class="category-item">
                <div class="category-item-name">${this.escapeHtml(cat.name)}</div>
                <div class="category-item-actions">
                    <button class="btn-small btn-edit" onclick="app.editCategory('${cat.id}')">编辑</button>
                    <button class="btn-small btn-delete" onclick="app.deleteCategory('${cat.id}')">删除</button>
                </div>
            </div>
        `).join('');

        this.updateCategorySelect();
    }

    updateCategorySelect() {
        const categories = this.getFromStorage('categories') || [];
        const select = document.getElementById('articleCategory');
        const currentValue = select.value;
        select.innerHTML = '<option value="">选择一个分类</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
        select.value = currentValue;
    }

    toggleAddForm() {
        const form = document.getElementById('addCategoryForm');
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('categoryName').focus();
        }
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const desc = document.getElementById('categoryDesc').value.trim();

        if (!name) {
            this.showNotification('请输入分类名称', 'error');
            return;
        }

        const categories = this.getFromStorage('categories') || [];
        categories.push({
            id: Date.now().toString(),
            name,
            description: desc
        });
        this.saveToStorage('categories', categories);
        this.loadCategories();
        this.toggleAddForm();
        this.showNotification('分类添加成功！', 'success');
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDesc').value = '';
    }

    editCategory(id) {
        const categories = this.getFromStorage('categories') || [];
        const cat = categories.find(c => c.id === id);
        if (cat) {
            this.currentEditCategoryId = id;
            document.getElementById('editCategoryName').value = cat.name;
            document.getElementById('editCategoryDesc').value = cat.description || '';
            document.getElementById('modal').classList.remove('hidden');
        }
    }

    updateCategory() {
        const name = document.getElementById('editCategoryName').value.trim();
        const desc = document.getElementById('editCategoryDesc').value.trim();

        if (!name) {
            this.showNotification('请输入分类名称', 'error');
            return;
        }

        const categories = this.getFromStorage('categories') || [];
        const index = categories.findIndex(c => c.id === this.currentEditCategoryId);
        if (index !== -1) {
            categories[index].name = name;
            categories[index].description = desc;
            this.saveToStorage('categories', categories);
            this.loadCategories();
            this.closeModal();
            this.showNotification('分类更新成功！', 'success');
        }
    }

    deleteCategory(id) {
        if (!confirm('确定要删除这个分类吗？')) return;
        let categories = this.getFromStorage('categories') || [];
        categories = categories.filter(c => c.id !== id);
        this.saveToStorage('categories', categories);
        this.loadCategories();
        this.showNotification('分类删除成功！', 'success');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        this.currentEditCategoryId = null;
    }

    toggleArticleForm() {
        const form = document.getElementById('addArticleForm');
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('articleTitle').focus();
            this.updateCategorySelect();
        } else {
            document.getElementById('articleTitle').value = '';
            document.getElementById('articleCategory').value = '';
            document.getElementById('articleSummary').value = '';
            document.getElementById('articleContent').value = '';
        }
    }

    saveArticle() {
        const categoryId = document.getElementById('articleCategory').value;
        const title = document.getElementById('articleTitle').value.trim();
        const summary = document.getElementById('articleSummary').value.trim();
        const content = document.getElementById('articleContent').value.trim();

        if (!categoryId) {
            this.showNotification('请选择分类', 'error');
            return;
        }
        if (!title) {
            this.showNotification('请输入文章标题', 'error');
            return;
        }
        if (!summary) {
            this.showNotification('请输入文章概要', 'error');
            return;
        }

        const articles = this.getFromStorage('articles') || [];
        articles.unshift({
            id: Date.now().toString(),
            categoryId,
            title,
            summary,
            content: content || summary,
            createdAt: new Date().toLocaleString('zh-CN')
        });
        this.saveToStorage('articles', articles);
        this.loadArticles();
        this.toggleArticleForm();
        this.showNotification('文章发布成功！', 'success');
    }

    loadArticles() {
        const articles = this.getFromStorage('articles') || [];
        const container = document.getElementById('articlesList');

        if (articles.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>暂无文章，开始发布你的第一篇文章吧！</p></div>';
            return;
        }

        const categories = this.getFromStorage('categories') || [];
        container.innerHTML = articles.map(article => {
            const category = categories.find(c => c.id === article.categoryId);
            return `
                <div class="article-card" onclick="app.viewArticle('${article.id}')">
                    <div class="article-card-header">
                        <div class="article-card-title">${this.escapeHtml(article.title)}</div>
                        ${category ? `<span class="article-card-category">${this.escapeHtml(category.name)}</span>` : ''}
                    </div>
                    <div class="article-card-summary">${this.escapeHtml(article.summary)}</div>
                    <div class="article-card-meta">
                        <span>📅 ${article.createdAt}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    viewArticle(id) {
        const articles = this.getFromStorage('articles') || [];
        const article = articles.find(a => a.id === id);
        if (article) {
            this.viewingArticleId = id;
            const categories = this.getFromStorage('categories') || [];
            const category = categories.find(c => c.id === article.categoryId);

            document.getElementById('articleModalTitle').textContent = this.escapeHtml(article.title);
            document.getElementById('articleModalBody').innerHTML = `
                ${category ? `<div class="article-modal-category">${this.escapeHtml(category.name)}</div>` : ''}
                <div class="article-modal-summary"><strong>概要：</strong> ${this.escapeHtml(article.summary)}</div>
                <div class="article-modal-content-text">${this.escapeHtml(article.content)}</div>
            `;
            document.getElementById('articleModal').classList.remove('hidden');
        }
    }

    closeArticleModal() {
        document.getElementById('articleModal').classList.add('hidden');
        this.viewingArticleId = null;
    }

    editArticleFromModal() {
        if (!this.viewingArticleId) return;
        const articles = this.getFromStorage('articles') || [];
        const article = articles.find(a => a.id === this.viewingArticleId);
        if (article) {
            document.getElementById('articleCategory').value = article.categoryId;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleSummary').value = article.summary;
            document.getElementById('articleContent').value = article.content;
            this.currentEditArticleId = this.viewingArticleId;

            const newArticles = articles.filter(a => a.id !== this.viewingArticleId);
            this.saveToStorage('articles', newArticles);

            this.closeArticleModal();
            this.toggleArticleForm();
            this.loadArticles();
        }
    }

    deleteArticleFromModal() {
        if (!confirm('确定要删除这篇文章吗？')) return;
        if (!this.viewingArticleId) return;

        let articles = this.getFromStorage('articles') || [];
        articles = articles.filter(a => a.id !== this.viewingArticleId);
        this.saveToStorage('articles', articles);
        this.loadArticles();
        this.closeArticleModal();
        this.showNotification('文章删除成功！', 'success');
    }

    logout() {
        if (confirm('确定要退出吗？')) {
            localStorage.clear();
            location.reload();
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
            this.showNotification('保存失败', 'error');
        }
    }

    getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('读取失败:', e);
            return null;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#4A90E2' : '#E74C3C'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
}

const app = new BlogApp();
window.app = app;
