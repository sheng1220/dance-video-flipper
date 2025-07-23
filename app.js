/**
 * 看影片學跳舞
 * 支援本地影片上傳、即時翻轉預覽、全螢幕播放
 */
class VideoFlipApp {
    constructor() {
        this.selectedFile = null;
        this.isFlipped = false;
        this.isFullscreen = false;
        this.fullscreenVideo = null;
        
        this.initializeElements();
        this.bindEvents();
        this.showNotification('看影片學跳舞已就緒，可以上傳影片了！', 'success');
    }

    /**
     * 初始化 DOM 元素
     */
    initializeElements() {
        // 上傳相關
        this.uploadSection = document.getElementById('uploadSection');
        this.uploadZone = document.getElementById('uploadZone');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        
        // 影片播放相關
        this.videoSection = document.getElementById('videoSection');
        this.mainVideo = document.getElementById('mainVideo');
        this.videoPlayer = document.getElementById('videoPlayer');
        
        // 控制按鈕
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.flipToggleBtn = document.getElementById('flipToggleBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.newVideoBtn = document.getElementById('newVideoBtn');
        
        // 控制按鈕文字和圖示
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.playPauseText = document.getElementById('playPauseText');
        this.flipText = document.getElementById('flipText');
        
        // 影片資訊
        this.videoFileName = document.getElementById('videoFileName');
        this.videoResolution = document.getElementById('videoResolution');
        this.videoDuration = document.getElementById('videoDuration');
        this.videoStatus = document.getElementById('videoStatus');
        
        // 進度條相關
        this.progressBar = document.getElementById('progressBar');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        
        // 全螢幕相關
        this.fullscreenOverlay = document.getElementById('fullscreenOverlay');
        this.fullscreenProgress = document.getElementById('fullscreenProgress');
        this.fullscreenControls = document.querySelector('.fullscreen-controls');
        this.fsProgressBar = document.getElementById('fsProgressBar');
        this.fsCurrentTime = document.getElementById('fsCurrentTime');
        this.fsTotalTime = document.getElementById('fsTotalTime');
        this.fsPlayPauseBtn = document.getElementById('fsPlayPauseBtn');
        this.fsRewindBtn = document.getElementById('fsRewindBtn');
        this.fsForwardBtn = document.getElementById('fsForwardBtn');
        this.fsFlipBtn = document.getElementById('fsFlipBtn');
        this.fsExitBtn = document.getElementById('fsExitBtn');
        this.fsPlayPauseIcon = document.getElementById('fsPlayPauseIcon');
        this.fsFlipStatus = document.getElementById('fsFlipStatus');
        
        // 全螢幕自動隱藏相關
        this.fullscreenHideTimer = null;
        
        // 通知容器
        this.notificationContainer = document.getElementById('notificationContainer');
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 檔案上傳事件
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        
        // 拖拽事件
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 影片控制事件
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.rewindBtn.addEventListener('click', () => this.rewind());
        this.forwardBtn.addEventListener('click', () => this.forward());
        this.flipToggleBtn.addEventListener('click', () => this.toggleFlip());
        this.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
        this.newVideoBtn.addEventListener('click', () => this.selectNewVideo());
        
        // 進度條事件
        this.progressBar.addEventListener('input', () => this.seekVideo());
        this.progressBar.addEventListener('change', () => this.seekVideo());
        
        // 影片事件
        this.mainVideo.addEventListener('play', () => this.updatePlayPauseButton(true));
        this.mainVideo.addEventListener('pause', () => this.updatePlayPauseButton(false));
        this.mainVideo.addEventListener('loadedmetadata', () => this.updateVideoInfo());
        this.mainVideo.addEventListener('timeupdate', () => {
            // 只有在非全螢幕模式下才更新主進度條
            if (!this.isFullscreen) {
                this.updateProgress();
            }
        });
        
        // 監聽全螢幕變化事件
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // 禁用右鍵選單
        this.mainVideo.addEventListener('contextmenu', (e) => e.preventDefault());
        this.mainVideo.disablePictureInPicture = true;
        this.mainVideo.controlsList = 'nodownload nofullscreen noremoteplayback';
        
        // 全螢幕控制事件 - 使用 onclick 以確保按鈕能正常響應
        this.fsPlayPauseBtn.onclick = () => this.toggleFullscreenPlayPause();
        this.fsRewindBtn.onclick = () => this.rewind();
        this.fsForwardBtn.onclick = () => this.forward();
        this.fsFlipBtn.onclick = () => this.toggleFlip();
        this.fsExitBtn.onclick = () => this.exitFullscreen();
        
        // 全螢幕進度條事件
        this.fsProgressBar.addEventListener('input', () => this.seekFullscreenVideo());
        this.fsProgressBar.addEventListener('change', () => this.seekFullscreenVideo());
        
        // 全螢幕自動隱藏事件
        this.fullscreenOverlay.addEventListener('mousemove', () => this.showFullscreenControls());
        this.fullscreenOverlay.addEventListener('click', () => this.showFullscreenControls());
        this.fullscreenOverlay.addEventListener('touchstart', () => this.showFullscreenControls());
        
        // 防止進度條和按鈕區域觸發隱藏
        this.fullscreenProgress.addEventListener('mouseover', () => this.clearFullscreenHideTimer());
        this.fullscreenControls.addEventListener('mouseover', () => this.clearFullscreenHideTimer());
        
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
    }

    /**
     * 處理檔案選擇
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * 處理拖拽懸停
     */
    handleDragOver(event) {
        event.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    /**
     * 處理拖拽離開
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.uploadZone.classList.remove('dragover');
    }

    /**
     * 處理檔案拖放
     */
    handleDrop(event) {
        event.preventDefault();
        this.uploadZone.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * 處理選中的檔案
     */
    async processFile(file) {
        try {
            // 驗證檔案
            if (!this.validateFile(file)) {
                return;
            }
            
            this.selectedFile = file;
            this.showNotification('載入影片中...', 'info');
            
            // 載入影片
            await this.loadVideo(file);
            
            // 顯示影片播放區域
            this.showVideoSection();
            
            this.showNotification('影片載入完成！可以開始播放和翻轉。', 'success');
            
        } catch (error) {
            console.error('檔案處理失敗:', error);
            this.showNotification('影片載入失敗，請檢查檔案格式。', 'error');
        }
    }

    /**
     * 驗證檔案
     */
    validateFile(file) {
        const supportedTypes = [
            'video/mp4', 'video/mpeg', 'video/quicktime', 
            'video/avi', 'video/webm', 'video/x-msvideo'
        ];
        
        const maxSize = 500 * 1024 * 1024; // 500MB
        
        if (!supportedTypes.some(type => file.type.includes(type.split('/')[1]))) {
            this.showNotification('不支援的檔案格式！請選擇 MP4、MOV、AVI 或 WebM 格式。', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('檔案過大！請選擇小於 500MB 的檔案。', 'error');
            return false;
        }
        
        if (file.size < 1024) {
            this.showNotification('檔案可能損壞或不是有效的影片檔案。', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * 載入影片
     */
    loadVideo(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            
            this.mainVideo.onloadeddata = () => {
                resolve();
            };
            
            this.mainVideo.onerror = () => {
                reject(new Error('影片載入失敗'));
            };
            
            this.mainVideo.src = url;
        });
    }

    /**
     * 顯示影片播放區域
     */
    showVideoSection() {
        this.uploadSection.style.display = 'none';
        this.videoSection.style.display = 'block';
        
        // 重設狀態
        this.isFlipped = false;
        this.mainVideo.classList.remove('flipped');
        this.updateFlipButton();
        this.updateVideoStatus();
    }


    /**
     * 更新影片資訊
     */
    updateVideoInfo() {
        if (this.selectedFile && this.mainVideo) {
            this.videoFileName.textContent = this.selectedFile.name;
            this.videoResolution.textContent = `${this.mainVideo.videoWidth} × ${this.mainVideo.videoHeight}`;
            this.videoDuration.textContent = this.formatDuration(this.mainVideo.duration);
        }
    }

    /**
     * 切換播放/暫停
     */
    togglePlayPause() {
        if (this.mainVideo.paused) {
            this.mainVideo.play();
            // 立即更新按鈕狀態
            this.updatePlayPauseButton(true);
        } else {
            this.mainVideo.pause();
            // 立即更新按鈕狀態
            this.updatePlayPauseButton(false);
        }
    }

    /**
     * 全螢幕模式下的播放/暫停控制
     */
    toggleFullscreenPlayPause() {
        if (this.isFullscreen && this.fullscreenVideo) {
            if (this.fullscreenVideo.paused) {
                this.fullscreenVideo.play();
                // 立即更新按鈕狀態為播放中（顯示暫停按鈕）
                this.updatePlayPauseButton(true);
            } else {
                this.fullscreenVideo.pause();
                // 立即更新按鈕狀態為暫停中（顯示播放按鈕）
                this.updatePlayPauseButton(false);
            }
        } else {
            this.togglePlayPause();
        }
    }

    /**
     * 更新播放/暫停按鈕
     */
    updatePlayPauseButton(isPlaying) {
        const icon = isPlaying ? '⏸️' : '▶️';
        const text = isPlaying ? '暫停' : '播放';
        
        this.playPauseIcon.textContent = icon;
        this.playPauseText.textContent = text;
        this.fsPlayPauseIcon.textContent = icon;
    }

    /**
     * 切換翻轉狀態
     */
    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            this.mainVideo.classList.add('flipped');
        } else {
            this.mainVideo.classList.remove('flipped');
        }
        
        // 如果在全螢幕模式，也要更新全螢幕影片
        if (this.isFullscreen && this.fullscreenVideo) {
            if (this.isFlipped) {
                this.fullscreenVideo.classList.add('flipped');
            } else {
                this.fullscreenVideo.classList.remove('flipped');
            }
        }
        
        this.updateFlipButton();
        this.updateVideoStatus();
        
        const status = this.isFlipped ? '翻轉' : '原始';
        this.showNotification(`已切換到${status}方向`, 'success');
    }

    /**
     * 更新翻轉按鈕
     */
    updateFlipButton() {
        this.flipText.textContent = this.isFlipped ? '原始' : '翻轉';
    }

    /**
     * 更新影片狀態
     */
    updateVideoStatus() {
        const status = this.isFlipped ? '翻轉方向' : '原始方向';
        this.videoStatus.textContent = status;
        this.fsFlipStatus.textContent = status;
    }

    /**
     * 進入全螢幕
     */
    async enterFullscreen() {
        try {
            this.isFullscreen = true;
            
            // 記住主影片的播放狀態
            const wasPlaying = !this.mainVideo.paused;
            
            // 複製影片到全螢幕覆蓋層
            this.fullscreenVideo = this.mainVideo.cloneNode(true);
            this.fullscreenVideo.currentTime = this.mainVideo.currentTime;
            this.fullscreenVideo.muted = this.mainVideo.muted;
            this.fullscreenVideo.controls = false; // 禁用原生控制
            this.fullscreenVideo.disablePictureInPicture = true;
            this.fullscreenVideo.controlsList = 'nodownload nofullscreen noremoteplayback';
            
            // 防止音頻重疊：暫停主影片並靜音（但記住狀態）
            this.mainVideo.pause();
            this.mainVideo.muted = true;
            
            // 禁用右鍵選單
            this.fullscreenVideo.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // 保持翻轉狀態
            if (this.isFlipped) {
                this.fullscreenVideo.classList.add('flipped');
            }
            
            // 清空覆蓋層並添加新影片
            const overlay = this.fullscreenOverlay;
            const existingVideo = overlay.querySelector('video');
            if (existingVideo) {
                existingVideo.remove();
            }
            
            // 在控制項之前插入影片
            overlay.insertBefore(this.fullscreenVideo, overlay.firstChild);
            
            // 顯示全螢幕覆蓋層（使用 block 而非 flex）
            overlay.style.display = 'block';
            
            // 綁定全螢幕影片事件
            this.fullscreenVideo.addEventListener('play', () => this.updatePlayPauseButton(true));
            this.fullscreenVideo.addEventListener('pause', () => this.updatePlayPauseButton(false));
            this.fullscreenVideo.addEventListener('timeupdate', () => this.updateFullscreenProgress());
            
            // 根據原始播放狀態決定是否播放全螢幕影片
            if (wasPlaying) {
                this.fullscreenVideo.play();
            }
            
            // 立即更新按鈕狀態和進度條
            this.updatePlayPauseButton(wasPlaying);
            
            // 等待影片載入後更新進度條
            if (this.fullscreenVideo.readyState >= 1) {
                this.updateFullscreenProgress();
            } else {
                this.fullscreenVideo.addEventListener('loadedmetadata', () => {
                    this.updateFullscreenProgress();
                }, { once: true });
            }
            
            // 嘗試進入瀏覽器全螢幕
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    await document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    await document.documentElement.msRequestFullscreen();
                }
            } catch (fsError) {
                console.log('瀏覽器全螢幕 API 不可用，使用模擬全螢幕');
            }
            
            this.showNotification('已進入全螢幕模式', 'success');
            
        } catch (error) {
            console.error('進入全螢幕失敗:', error);
            this.showNotification('進入全螢幕失敗', 'error');
            this.exitFullscreen();
        }
    }

    /**
     * 退出全螢幕
     */
    exitFullscreen() {
        this.isFullscreen = false;
        
        // 清理全螢幕相關計時器
        this.clearFullscreenHideTimer();
        
        // 同步影片時間回主影片
        if (this.fullscreenVideo) {
            const wasPlaying = !this.fullscreenVideo.paused;
            this.mainVideo.currentTime = this.fullscreenVideo.currentTime;
            this.mainVideo.muted = false; // 恢復主影片音頻
            
            if (wasPlaying) {
                this.mainVideo.play();
            } else {
                this.mainVideo.pause();
            }
            
            // 立即更新按鈕狀態以確保正確顯示
            this.updatePlayPauseButton(wasPlaying);
        }
        
        // 隱藏覆蓋層
        this.fullscreenOverlay.style.display = 'none';
        
        // 退出瀏覽器全螢幕
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (error) {
            console.log('退出全螢幕 API 錯誤:', error);
        }
        
        // 清理全螢幕影片
        if (this.fullscreenVideo) {
            this.fullscreenVideo.remove();
            this.fullscreenVideo = null;
        }
        
        // 最後再次確認按鈕狀態正確性
        setTimeout(() => {
            this.updatePlayPauseButton(!this.mainVideo.paused);
        }, 100);
        
        this.showNotification('已退出全螢幕模式', 'info');
    }

    /**
     * 處理全螢幕變化
     */
    handleFullscreenChange() {
        const isInFullscreen = !!(document.fullscreenElement || 
                                   document.webkitFullscreenElement || 
                                   document.mozFullScreenElement || 
                                   document.msFullscreenElement);
        
        // 如果影片進入原生全螢幕，強制退出並使用自定義全螢幕
        const isNativeFullscreen = document.webkitFullscreenElement === this.mainVideo || 
                                  document.fullscreenElement === this.mainVideo;
        
        if (isNativeFullscreen) {
            // 退出原生全螢幕
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            
            // 使用自定義全螢幕
            setTimeout(() => {
                this.enterFullscreen();
            }, 100);
            
            this.showNotification('自動切換到自定義全螢幕模式', 'info');
        } else if (!isInFullscreen && this.isFullscreen) {
            // 用戶退出瀏覽器全螢幕時，也退出自定義全螢幕
            this.exitFullscreen();
        }
    }

    /**
     * 處理鍵盤快捷鍵
     */
    handleKeyboard(event) {
        if (!this.selectedFile) return;
        
        // 如果在全螢幕模式，顯示控制項
        if (this.isFullscreen) {
            this.showFullscreenControls();
        }
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (this.isFullscreen) {
                    this.toggleFullscreenPlayPause();
                } else {
                    this.togglePlayPause();
                }
                break;
            case 'KeyF':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    } else {
                        this.enterFullscreen();
                    }
                } else {
                    this.toggleFlip();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.rewind();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.forward();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
        }
    }

    /**
     * 選擇新影片
     */
    selectNewVideo() {
        // 重設狀態
        this.selectedFile = null;
        this.isFlipped = false;
        
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        // 清理現有影片
        this.mainVideo.src = '';
        this.fileInput.value = '';
        
        // 顯示上傳區域
        this.videoSection.style.display = 'none';
        this.uploadSection.style.display = 'block';
        
        this.showNotification('請選擇新的影片檔案', 'info');
    }

    /**
     * 顯示通知
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // 3秒後移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * 更新進度條
     */
    updateProgress() {
        if (this.mainVideo.duration) {
            const progress = (this.mainVideo.currentTime / this.mainVideo.duration) * 100;
            this.progressBar.value = progress;
            
            this.currentTime.textContent = this.formatDuration(this.mainVideo.currentTime);
            this.totalTime.textContent = this.formatDuration(this.mainVideo.duration);
        }
    }

    /**
     * 更新全螢幕進度條
     */
    updateFullscreenProgress() {
        if (this.isFullscreen && this.fullscreenVideo && this.fullscreenVideo.duration) {
            const progress = (this.fullscreenVideo.currentTime / this.fullscreenVideo.duration) * 100;
            this.fsProgressBar.value = progress;
            
            this.fsCurrentTime.textContent = this.formatDuration(this.fullscreenVideo.currentTime);
            this.fsTotalTime.textContent = this.formatDuration(this.fullscreenVideo.duration);
            
            // 同步回主影片的時間（但不觸發播放）
            this.mainVideo.currentTime = this.fullscreenVideo.currentTime;
        }
    }

    /**
     * 跳轉到指定時間
     */
    seekVideo() {
        if (this.mainVideo.duration) {
            const seekTime = (this.progressBar.value / 100) * this.mainVideo.duration;
            this.mainVideo.currentTime = seekTime;
            
            // 如果在全螢幕模式，也要同步全螢幕影片
            if (this.isFullscreen && this.fullscreenVideo) {
                this.fullscreenVideo.currentTime = seekTime;
                // 確保按鈕狀態正確反映當前播放狀態
                this.updatePlayPauseButton(!this.fullscreenVideo.paused);
            } else {
                // 確保按鈕狀態正確反映當前播放狀態
                this.updatePlayPauseButton(!this.mainVideo.paused);
            }
        }
    }

    /**
     * 倒轉10秒
     */
    rewind() {
        const currentVideo = this.isFullscreen && this.fullscreenVideo ? this.fullscreenVideo : this.mainVideo;
        currentVideo.currentTime = Math.max(0, currentVideo.currentTime - 10);
        
        // 同步兩個影片的時間
        if (this.isFullscreen && this.fullscreenVideo) {
            this.mainVideo.currentTime = this.fullscreenVideo.currentTime;
        }
        
        // 確保按鈕狀態正確反映當前播放狀態
        this.updatePlayPauseButton(!currentVideo.paused);
    }

    /**
     * 快轉10秒
     */
    forward() {
        const currentVideo = this.isFullscreen && this.fullscreenVideo ? this.fullscreenVideo : this.mainVideo;
        currentVideo.currentTime = Math.min(currentVideo.duration, currentVideo.currentTime + 10);
        
        // 同步兩個影片的時間
        if (this.isFullscreen && this.fullscreenVideo) {
            this.mainVideo.currentTime = this.fullscreenVideo.currentTime;
        }
        
        // 確保按鈕狀態正確反映當前播放狀態
        this.updatePlayPauseButton(!currentVideo.paused);
    }

    /**
     * 全螢幕進度條跳轉
     */
    seekFullscreenVideo() {
        if (this.isFullscreen && this.fullscreenVideo && this.fullscreenVideo.duration) {
            const seekTime = (this.fsProgressBar.value / 100) * this.fullscreenVideo.duration;
            this.fullscreenVideo.currentTime = seekTime;
            this.mainVideo.currentTime = seekTime;
            
            // 確保按鈕狀態正確反映當前播放狀態
            this.updatePlayPauseButton(!this.fullscreenVideo.paused);
        }
    }

    /**
     * 顯示全螢幕控制項
     */
    showFullscreenControls() {
        if (!this.isFullscreen) return;
        
        this.fullscreenProgress.classList.remove('hidden');
        this.fullscreenControls.classList.remove('hidden');
        
        // 清除現有計時器
        this.clearFullscreenHideTimer();
        
        // 如果影片正在播放，3秒後自動隱藏
        if (this.fullscreenVideo && !this.fullscreenVideo.paused) {
            this.fullscreenHideTimer = setTimeout(() => {
                this.hideFullscreenControls();
            }, 3000);
        }
    }

    /**
     * 隱藏全螢幕控制項
     */
    hideFullscreenControls() {
        if (!this.isFullscreen) return;
        
        this.fullscreenProgress.classList.add('hidden');
        this.fullscreenControls.classList.add('hidden');
        this.clearFullscreenHideTimer();
    }

    /**
     * 清除全螢幕隱藏計時器
     */
    clearFullscreenHideTimer() {
        if (this.fullscreenHideTimer) {
            clearTimeout(this.fullscreenHideTimer);
            this.fullscreenHideTimer = null;
        }
    }

    /**
     * 工具函數：格式化時長
     */
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }
}

// 應用程式啟動
document.addEventListener('DOMContentLoaded', () => {
    new VideoFlipApp();
});