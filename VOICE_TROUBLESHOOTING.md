# VoiceCart - Voice Recognition Troubleshooting Guide

## 🎤 Voice Not Working? Follow These Steps:

### 1. **Check Browser Compatibility**
Voice recognition works best in:
- ✅ **Chrome** (recommended)
- ✅ **Microsoft Edge** 
- ✅ **Safari** (macOS/iOS)
- ❌ **Firefox** (limited support)

### 2. **Enable Microphone Permissions**
1. Click the microphone icon in your browser's address bar
2. Select "Allow" for microphone access
3. If blocked, go to browser settings and enable microphone for localhost

### 3. **Check HTTPS Requirement**
- Voice recognition requires HTTPS in production
- For localhost development, HTTP is usually fine
- If issues persist, try: `https://localhost:3000`

### 4. **Test Steps**
1. **Test Speech Synthesis First**:
   - Click the "🔊 Test Speech" button (bottom right)
   - You should hear: "Voice synthesis is working correctly..."

2. **Test Voice Recognition**:
   - Click the microphone button (🎤)
   - Say "hello" or "test"
   - You should hear: "Hello! Voice recognition is working correctly."

3. **Try Simple Commands**:
   - "go to home"
   - "show cart" 
   - "help"

### 5. **Debug Console**
Open browser Developer Tools (F12) and check the Console tab for:
- "Speech Recognition initialized" ✅
- "Speech Synthesis initialized" ✅
- Any error messages ❌

### 6. **Common Issues & Solutions**

#### Issue: "Microphone access denied"
**Solution**: 
- Click the microphone icon in address bar
- Select "Always allow" for this site
- Refresh the page

#### Issue: "No speech detected"
**Solution**:
- Speak clearly and loudly
- Check microphone is working (test in other apps)
- Try moving closer to microphone

#### Issue: "Network error"
**Solution**:
- Check internet connection
- Voice recognition needs internet for processing

#### Issue: Voice button not visible
**Solution**:
- Check if `isSupported` is true in console
- Try a different browser (Chrome recommended)

### 7. **Browser Settings**

#### Chrome:
1. Go to Settings → Privacy and Security → Site Settings
2. Click "Microphone"
3. Ensure localhost is in "Allow" list

#### Edge:
1. Go to Settings → Site Permissions → Microphone
2. Add localhost to allowed sites

### 8. **Test Commands**
Once working, try these commands:
- **Navigation**: "go to home", "show cart", "go to health category"
- **Search**: "search for vitamins"
- **Help**: "help" or "what can I say"

### 9. **Still Not Working?**
1. Try incognito/private browsing mode
2. Restart browser completely
3. Check Windows microphone privacy settings
4. Test microphone in other applications first

## 🔧 Debug Information
The enhanced VoiceButton now includes:
- Detailed console logging
- Better error messages
- Permission checking
- Test speech button

Check the browser console (F12) for detailed debug information when clicking the voice button.