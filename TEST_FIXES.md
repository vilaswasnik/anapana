# Testing Pause/Resume and Time Adjustment Fixes

## What Was Fixed

### 1. **Pause/Resume Issue**
- **Problem**: Timer wasn't properly resuming after pause
- **Root Cause**: Logic error in `startTimer()` function - checked `!this.isRunning` before `this.isPaused`
- **Fix**: Reordered conditions to check `this.isPaused` first, then `!this.isRunning`

### 2. **Time Adjustment During Meditation**
- **Problem**: Could not change time duration once meditation started
- **Root Cause**: `setPresetTime()` and `setCustomTime()` only worked when `!this.isRunning`
- **Fix**: Removed restriction and added smart time adjustment logic

## Test Cases

### Test 1: Basic Pause/Resume
1. Start a 10-minute meditation
2. Let it run for ~30 seconds
3. Click pause - timer should stop
4. Click resume - timer should continue from where it paused
5. ✅ **Expected**: Seamless pause and resume functionality

### Test 2: Time Adjustment While Running
1. Start a 5-minute meditation
2. Let it run for ~30 seconds
3. Click on "10 min" preset button
4. ✅ **Expected**: Timer adjusts to 10 minutes total, keeping elapsed time

### Test 3: Time Adjustment While Paused
1. Start a 10-minute meditation
2. Let it run for ~30 seconds
3. Pause the timer
4. Click on "20 min" preset button
5. Resume the timer
6. ✅ **Expected**: Timer continues with new 20-minute duration

### Test 4: Custom Time Adjustment
1. Start any meditation
2. Use custom time inputs (e.g., 7 minutes 30 seconds)
3. Click "Set Custom Time"
4. ✅ **Expected**: Timer adjusts to custom duration

### Test 5: Edge Cases
1. Start 5-minute meditation, let run for 3 minutes
2. Change to 2-minute preset (less than elapsed time)
3. ✅ **Expected**: Timer should handle gracefully without breaking

## Technical Details

### Smart Time Adjustment Logic
- **Extending Time**: Adds extra time to the session
- **Reducing Time**: Ensures timer doesn't go negative
- **Preserves Progress**: Maintains elapsed time when adjusting duration
- **Works During**: Running, paused, or stopped states

### Code Changes Made
- `startTimer()`: Fixed pause/resume logic order
- `setPresetTime()`: Removed `!this.isRunning` restriction + smart adjustment
- `setCustomTime()`: Removed `!this.isRunning` restriction + smart adjustment

## Status: ✅ FIXED
Both issues should now be resolved. You can pause/resume anytime and adjust time duration even during active meditation sessions.