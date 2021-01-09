"use strict";
{
    C3.Plugins.Gritsenko_Spine.Acts = {

        SetSkin(skinName){
            this.skinName = skinName;

            this.updateCurrentSkin();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        Flip(isFlipped){
            this.isMirrored = isFlipped;
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetAnimation(animationName, loop, start, trackIndex){
            this.animationName = animationName;

            this.updateCurrentAnimation(loop, start, trackIndex, animationName);
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetAlpha(alpha, trackIndex){
            const state = this.skeletonInfo.state;
            if(!state || !state.tracks) return;
            const track = state.tracks[trackIndex];
            if(!track) return;

            // Clamp alpha to 1-0
            track.alpha = Math.max(0,Math.min(1,alpha));
            spineBatcher.setInstanceRenderOnce(true, this.uid);
       },

        DeleteAnimation(trackIndex, mixDuration) {
            const state = this.skeletonInfo.state;
            if(!state || !state.tracks) return;
            const track = state.tracks[trackIndex];
            if(!track) return;

            state.setEmptyAnimation(trackIndex, mixDuration);
        },

        Play(){
            this.playAnimation();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        Stop(){
            this.stopAnimation();
        },

        UpdateBounds() {
            this.updateBounds();
        },
        SetAnimationSpeed(speed){
            this.animationSpeed = speed;
        },
        
        SetRegion(slotName, attachmentName, regionName){

            // First get the new region from the atlas.
            const atlas = this.skeletonInfo.atlas;
            const skeleton = this.skeletonInfo.skeleton;

            let region = atlas.findRegion(regionName);
            if (region == null) throw new Error("Region not found in atlas: " + regionName);

            // Get the existing attachment, if skin not on skeleton
            // let skin = skeleton.data.findSkin(skinName)
            let slotIndex = skeleton.data.findSlot(slotName).index
            // let existing = skin.getAttachment(slotIndex, 'hairs');

            // Alternatively if the skin is set on the skeleton, you can get it from the skeleton.
            let existing = skeleton.getAttachment(slotIndex, attachmentName);

            // Now do what AtlasAttachmentLoader does:
            // https://github.com/EsotericSoftware/spine-runtimes/blob/3.8/spine-ts/core/src/AtlasAttachmentLoader.ts#L42
            region.renderObject = region;
            existing.setRegion(region);

            // Need to do one last thing, which SkeletonJson/SkeletonBinary do last:
            // https://github.com/EsotericSoftware/spine-runtimes/blob/3.8/spine-ts/core/src/SkeletonJson.ts#L326-L340
            existing.updateOffset();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetAttachment(slotName, attachmentName)
        {
            const skeleton = this.skeletonInfo.skeleton;

            skeleton.setAttachment(slotName,attachmentName);
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        CreateCustomSkin(skinName)
        {
            const skeleton = this.skeletonInfo.skeleton;
            
            this.customSkins[skinName] = new spine.Skin(skinName);
        },

        AddCustomSkin(skinName,addSkinName)
        {
            if (!this.skeletonInfo || !this.skeletonInfo.skeleton)
            {
                if (this.debug) console.log('[Spine] AddCustomSkin, error - skeleton is not available');
                return;
            }

            const skeleton = this.skeletonInfo.skeleton;

            if (this.customSkins[skinName])
            {
                let addSkin = skeleton.data.findSkin(addSkinName);
                if (addSkin)
                {
                    this.customSkins[skinName].addSkin(skeleton.data.findSkin(addSkinName));
                } else
                {
                    if (this.debug) console.log('[Spine] AddCustomSkin, error - add skin does not exist',addSkinName);
                }
            } else
            {
                if (this.debug) console.log('[Spine] AddCustomSkin, error - custom skin does not exist',skinName);
            }
        },

        SetCustomSkin(skinName)
        {
            this.skinName = skinName
            const skeleton = this.skeletonInfo.skeleton;
            this.customSkins[this.skinName]
            skeleton.setSkin(this.customSkins[this.skinName]);
            skeleton.setSlotsToSetupPose();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetCustomAttachmentColor(skinName, slotName, attachmentName, color)
        {
            const skeleton = this.skeletonInfo.skeleton;
            let skin = this.customSkins[skinName];
            let slotIndex = skeleton.data.findSlot(slotName).index;
            let slot = skeleton.findSlot(slotName);
            let attachment = skin.getAttachment(slotIndex, attachmentName);
            let newAttachment = attachment.copy();

            let tint = new spine.Color(
                SpineBatch.getRValue(color),
                SpineBatch.getGValue(color),
                SpineBatch.getBValue(color),
                SpineBatch.getAValue(color));
            
            newAttachment.color = tint;
            skin.setAttachment(slotIndex, attachmentName, newAttachment);
            skeleton.setSkin(this.customSkins[skinName]);
            skeleton.setSlotsToSetupPose();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetSlotColor(slotName, color)
        {
            this.slotColors[slotName] = color;
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetSlotDarkColor(slotName, darkColor)
        {
            this.slotDarkColors[slotName] = darkColor;
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        ApplySlotColors()
        {
            const skeleton = this.skeletonInfo.skeleton;
            // Set regular colors to slots
            let slotName;
            for(slotName in this.slotColors)
            {
                let slot = skeleton.findSlot(slotName);
                let color = this.slotColors[slotName];
                slot.color.set(
                    SpineBatch.getRValue(color),
                    SpineBatch.getGValue(color),
                    SpineBatch.getBValue(color),
                    SpineBatch.getAValue(color));               
            }

            // Set dark colors to slots
            for(slotName in this.slotDarkColors)
            {
                let slot = skeleton.findSlot(slotName);
                // Set only if dark Color is available, (Tint Black must be applied to the slot in the project.)
                if (slot.darkColor)
                {
                    let color = this.slotDarkColors[slotName];
                    slot.darkColor.set(
                        SpineBatch.getRValue(color),
                        SpineBatch.getGValue(color),
                        SpineBatch.getBValue(color),
                        SpineBatch.getAValue(color));
                }                
            }
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        ResetSlotColors()
        {
            const skeleton = this.skeletonInfo.skeleton;
            this.slotColors = {};
            this.slotDarkColors = {};
            skeleton.setSlotsToSetupPose();
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        SetAnimationTime(units, time, trackIndex)
        {
            const state = this.skeletonInfo.state;
            if(!state || !state.tracks) return;

            const track = state.tracks[trackIndex];
            if(!track) return; 

            if (units == 0)
            // time in ms
            {
                if (time < track.animationStart || time > track.animationEnd)
                {
                    console.error('[Spine] SetAnimationTime time out of bounds:', time);
                    return;
                }
                track.trackTime = time;
            } else
            // time in ratio
            {
                if (time < 0 || time > 1)
                {
                    console.error('[Spine] SetAnimationTime ratio out of bounds:', time);
                    return;
                }
                track.trackTime = time * (track.animationEnd - track.animationStart);
            }
            spineBatcher.setInstanceRenderOnce(true, this.uid);
        },

        UpdateBBoxes()
        {
            this.skeletonInfo.skeletonBounds.update(this.skeletonInfo.skeleton, true);
        },
        
        SetAnimationMix(fromName, toName, duration)
        {
            const stateData = this.skeletonInfo.stateData;
            try
            {
                stateData.setMix(fromName, toName, duration);
            }
            catch (error)
            {
                console.error('[Spine] SetAnimationMix:', error);
            }
        },

        SetObjectRenderRate(renderRate)
        {
            globalThis.spineBatcher.renderRate = renderRate;
        }

    };
}