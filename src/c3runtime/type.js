"use strict";
{
    C3.Plugins.Gritsenko_Spine.Type = class SpineType extends C3.SDKTypeBase
    {
        constructor(objectClass)
        {
            super(objectClass);
        }

        Release()
        {
            super.Release();
        }

        OnCreate()
        {
            this.GetImageInfo().LoadAsset(this._runtime);
            this._skeletonData = {'notInitialized' : true}
            // Skeleton instances to render
            this._skeletonInstances = {};
            this._rendered = false;
        }

        LoadTextures(renderer)
        {
            return this.GetImageInfo().LoadStaticTexture(renderer,
            {
                linearSampling: this._runtime.IsLinearSampling()
            });
        }

        ReleaseTextures()
        {
            this.GetImageInfo().ReleaseTexture();
        }
    };
}