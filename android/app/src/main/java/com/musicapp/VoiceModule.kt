package com.musicapp

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import com.facebook.react.bridge.*
import java.util.Locale

class VoiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val REQUEST_CODE = 1597
        private var pendingPromise: Promise? = null
        private var instance: VoiceModule? = null

        fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == REQUEST_CODE) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                    val text = results?.firstOrNull() ?: ""
                    pendingPromise?.resolve(text)
                } else {
                    pendingPromise?.reject("CANCELLED", "Voice recognition cancelled")
                }
                pendingPromise = null
            }
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = "VoiceSearch"

@ReactMethod
fun startListening(promise: Promise) {
    pendingPromise = promise
    try {
        val activity = reactApplicationContext.currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity")
            pendingPromise = null
            return
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Search for songs...")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }

        (activity as Activity).startActivityForResult(intent, REQUEST_CODE)

    } catch (e: Exception) {
        promise.reject("VOICE_ERROR", e.message)
        pendingPromise = null
    }
}
}
