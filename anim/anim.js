import { lerp, inverseLerp } from "../math/general.js";

/**Calls lerp, but on keyframe values
 * This does not work with time offset as interpolant, use KeyFrame_lerp_time instead
 *
 * interpolant must be a value between 0.0 and 1.0
 */
function Keyframe_lerp(first, second, interpolant) {
  return lerp(first.value, second.value, interpolant);
}
/**Given two keyframes and a current time, interpolate between them
 * Time should be between both first->time and second->time
 * Which are the times of the keyframes as offset in their track
 * 
 * Example:
 * `
 * KeyFrameP first  = KeyFrame_create( 25.0, 0.0  );
 * KeyFrameP second = KeyFrame_create( 75.0, 10.0 );
 * 
 * float currentTime = 50.0;
 * 
 * KeyFrame_lerp_time (first, second, currentTime); //returns 5.0
 * //This is because currentTime was half way between the key frames (25 and 75)
 * //So result is half way between 0 and 10 (keyframe values)
 * `
 */


function Keyframe_lerp_time(first, second, time) {
  return Keyframe_lerp(first, second, inverseLerp(first.time, second.time, time));
} //========Track


export class Track {
  constructor() {
    this.keyframes = new Set();
    this.duration = 0;
  }

  createKeyframe(time, value) {
    let result = {
      time: time,
      value: value
    };
    this.keyframes.add(result);
    if (time > this.duration) this.duration = time;
    return result;
  }

  getValueAtTime(time) {
    if (this.getKeyframeCount() < 1) return 0;
    let start = this.getKeyframeFloor(time);
    let end = this.getKeyframeCeil(time); //If no keyframe before time

    if (!start) return 0; //If no keyframe after, return last known

    if (!end) return start.value; //Linear interpolate between the frames

    return Keyframe_lerp_time(start, end, time);
  }

  setValueAtTime(time, value) {
    let kf = this.getKeyframeAt(time, 0.001, true);
    kf.value = value;
    return this;
  }

  getKeyframeCount() {
    return this.keyframes.size;
  }

  hasKeyframes() {
    return this.keyframes.size > 1;
  }

  getKeyframeFloor(time) {
    if (this.getKeyframeCount() < 1) return null;
    let latest = undefined;

    for (let frame of this.keyframes) {
      //Make sure we don't return frames after the time
      if (frame.time > time) {
        return latest; //Update latest
      } else if (!latest || frame.time > latest.time) {
        latest = frame;
      }
    }

    return latest;
  }

  getKeyframeCeil(time) {
    if (this.getKeyframeCount() < 1) return null;
    let earliest = undefined;

    for (let frame of this.keyframes) {
      //Make sure we don't return frames before the time
      if (frame.time < time) {//Do nothing
        //Update latest
      } else if (!earliest || frame.time < earliest.time) {
        earliest = frame;
      }
    }

    return earliest;
  }

  getKeyframeAt(time, timeTolerance = 0.001, createIfNeeded = true) {
    if (!this.hasKeyframes() && createIfNeeded) {
      return this.createKeyframe(time, 0);
    }

    for (let frame of this.keyframes) {
      if (timeTolerance === 0 && frame.time == time || Math.abs(frame.time - time) <= timeTolerance) {
        return frame;
      }
    }

    if (!createIfNeeded) return null;
    return this.createKeyframe(time, 0);
  }

}