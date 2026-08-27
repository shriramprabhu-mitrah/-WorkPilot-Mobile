package com.jiramobileapplication

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DownloadModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DownloadModule"
    }

    @ReactMethod
    fun downloadFile(
        url: String,
        fileName: String,
        promise: Promise
    ) {
        try {
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setTitle(fileName)
                setDescription("Downloading file...")
                setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                )
                setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    fileName
                )
                allowScanningByMediaScanner()
            }

            val manager = reactApplicationContext.getSystemService(
                Context.DOWNLOAD_SERVICE
            ) as DownloadManager

            manager.enqueue(request)
            promise.resolve("Download started successfully")
        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", e.localizedMessage, e)
        }
    }
}