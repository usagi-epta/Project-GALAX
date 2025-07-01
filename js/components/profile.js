/**

- Profile Management Component
  */

class ProfileManager {
constructor() {
this.bindEventHandlers();
}

```
bindEventHandlers() {
    this.edit = this.edit.bind(this);
}

edit() {
    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Profile</h3>
                <button onclick="this.closest('.edit-profile-modal').remove()">✕</button>
            </div>
            <div class="profile-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editName" value="${this.getCurrentUserName()}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <input type="text" id="editStatus" value="Online" maxlength="50">
                </div>
                <div class="form-group">
                    <label>Avatar</label>
                    <div class="avatar-selection">
                        ${this.createAvatarSelection()}
                    </div>
                </div>
                <div class="form-actions">
                    <button onclick="this.closest('.edit-profile-modal').remove()">Cancel</button>
                    <button onclick="window.Profile.save()">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

createAvatarSelection() {
    const avatars = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4'];
    return avatars.map((avatar, index) => 
        `<div class="mini-avatar ${avatar}" onclick="window.Profile.selectAvatar(${index + 1})"></div>`
    ).join('');
}

selectAvatar(avatarId) {
    document.querySelectorAll('.mini-avatar').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.mini-avatar.avatar-${avatarId}`).classList.add('selected');
    
    if (window.stateManager) {
        window.stateManager.setState('user.avatar', avatarId);
    }
}

save() {
    const name = document.getElementById('editName')?.value;
    const status = document.getElementById('editStatus')?.value;
    
    if (name) {
        document.getElementById('currentUser').textContent = name;
        document.getElementById('profileName').textContent = name;
        
        if (window.stateManager) {
            window.stateManager.setState('user.username', name);
            window.stateManager.setState('user.profile.name', name);
            window.stateManager.setState('user.profile.status', status);
        }
    }
    
    document.querySelector('.edit-profile-modal')?.remove();
}

getCurrentUserName() {
    return document.getElementById('currentUser')?.textContent || 'Ninomiya';
}
```

}

const profileManager = new ProfileManager();

window.Profile = {
edit: profileManager.edit,
save: () => profileManager.save(),
selectAvatar: (id) => profileManager.selectAvatar(id)
};

if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { ProfileManager, profileManager };
} else if (typeof window !== ‘undefined’) {
window.ProfileManager = ProfileManager;
window.profileManager = profileManager;
}
