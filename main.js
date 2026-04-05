class BlogApp {
    constructor() {
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadProfile();
        this.loadCategories();
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        document.getElementById('saveProfile').addEventListener('click', () => this.saveProfile());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showAddForm());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.hideAddForm());
        document.getElementById('updateCategoryBtn').addEventListener('click', () => this.updateCategory());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    switchTab(e) {
        const tabName = e.target.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    loadProfile() {
        const profile = this.getFromStorage('profile');
        if (profile) {
            document.getElementById('userName').value = profile.name || '';
            document.getElementById('userJob').value = profile.job || '';
            document.getElementById('userBio').value = profile.bio || '';
        }
    }

    saveProfile() {
        const profile = {
            name: document.getElementById('userName').value,
            job: document.getElementById('userJob').value,
            bio: document.getElementById('userBio').value
        };

        this.saveToStorage('profile', profile);
        this.showNotification('个人信息保存成功！', 'success');
    }

    loadCategories() {
        const categories = this.getFromStorage('categories') || [];
        const container = document.getElementById('categoriesList');

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>还没有添加任何分类，点击上方按钮开始创建吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="category-card" data-id="${category.id}">
                <h3>${this.escapeHtml(category.name)}</h3>
                <p>${this.escapeHtml(category.description)}</p>
                <div class="category-actions">
                    <button class="btn btn-small btn-edit" onclick="app.editCategory('${category.id}')">编辑</button>
                    <button class="btn btn-small btn-delete" onclick="app.deleteCategory('${category.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    showAddForm() {
        document.getElementById('addCategoryForm').classList.remove('hidden');
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDesc').value = '';
        document.getElementById('categoryName').focus();
    }

    hideAddForm() {
        document.getElementById('addCategoryForm').classList.add('hidden');
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDesc').value.trim();

        if (!name) {
            this.showNotification('请输入分类名称', 'error');
            return;
        }

        const categories = this.getFromStorage('categories') || [];
        const newCategory = {
            id: Date.now().toString(),
            name,
            description
        };

        categories.push(newCategory);
        this.saveToStorage('categories', categories);
        this.loadCategories();
        this.hideAddForm();
        this.showNotification('分类添加成功！', 'success');
    }

    editCategory(id) {
        const categories = this.getFromStorage('categories') || [];
        const category = categories.find(c => c.id === id);

        if (category) {
            this.currentEditId = id;
            document.getElementById('editCategoryName').value = category.name;
            document.getElementById('editCategoryDesc').value = category.description;
            document.getElementById('modal').classList.remove('hidden');
        }
    }

    updateCategory() {
        const name = document.getElementById('editCategoryName').value.trim();
        const description = document.getElementById('editCategoryDesc').value.trim();

        if (!name) {
            this.showNotification('请输入分类名称', 'error');
            return;
        }

        const categories = this.getFromStorage('categories') || [];
        const index = categories.findIndex(c => c.id === this.currentEditId);

        if (index !== -1) {
            categories[index].name = name;
            categories[index].description = description;
            this.saveToStorage('categories', categories);
            this.loadCategories();
            this.closeModal();
            this.showNotification('分类更新成功！', 'success');
        }
    }

    deleteCategory(id) {
        if (!confirm('确定要删除这个分类吗？')) {
            return;
        }

        let categories = this.getFromStorage('categories') || [];
        categories = categories.filter(c => c.id !== id);
        this.saveToStorage('categories', categories);
        this.loadCategories();
        this.showNotification('分类删除成功！', 'success');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        this.currentEditId = null;
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('保存数据失败:', e);
            this.showNotification('保存失败，请检查浏览器设置', 'error');
        }
    }

    getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('读取数据失败:', e);
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
            top: 20px;
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
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

const app = new BlogApp();
window.app = app;
