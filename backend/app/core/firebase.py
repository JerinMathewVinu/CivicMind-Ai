import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore, storage
from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("firebase")

def init_firebase() -> firebase_admin.App:
    if firebase_admin._apps:
        return firebase_admin.get_app()

    try:
        if settings.google_application_credentials:
            cred = credentials.Certificate(settings.google_application_credentials)
        else:
            cred = credentials.ApplicationDefault()
        app = firebase_admin.initialize_app(
            cred,
            {
                "projectId": settings.firebase_project_id,
                "storageBucket": settings.firebase_storage_bucket,
            },
        )
    except Exception:
        # Fallback for development without service account config
        log.warning("firebase_credentials_not_found_using_mock")
        app = firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
    
    log.info("firebase_initialized", project=settings.firebase_project_id)
    return app

def get_firestore():
    init_firebase()
    return firestore.client()

def get_auth():
    init_firebase()
    return fb_auth

def get_bucket():
    init_firebase()
    return storage.bucket()