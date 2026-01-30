package com.yeardots.app.wallpaper

import android.app.WallpaperManager
import android.graphics.BitmapFactory
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WallpaperModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WallpaperModule")
    
    Function("setWallpaper") { uri: String, flag: Int ->
      val context = appContext.reactContext ?: throw Exception("React context not available")
      val wallpaperManager = WallpaperManager.getInstance(context)
      val filePath = uri.replace("file://", "")
      val bitmap = BitmapFactory.decodeFile(filePath)
        ?: throw Exception("Failed to decode bitmap")
      
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        val which = when (flag) {
          1 -> WallpaperManager.FLAG_SYSTEM
          2 -> WallpaperManager.FLAG_LOCK
          3 -> WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK
          else -> WallpaperManager.FLAG_SYSTEM
        }
        wallpaperManager.setBitmap(bitmap, null, true, which)
      } else {
        wallpaperManager.setBitmap(bitmap)
      }
      true
    }
  }
}