# ============================================================
# disease_symptoms.py
# Complete 50 Disease → Symptoms Mapping
# Medical AI Assistant — Harsh Panwar
# ============================================================

DISEASE_SYMPTOMS = {

    # ─── INFECTIOUS DISEASES ────────────────────────────────

    "Tuberculosis": [
        "cough", "fever", "night_sweats", "weight_loss",
        "fatigue", "chest_pain", "blood_in_sputum",
        "shortness_of_breath", "loss_of_appetite", "chills"
    ],

    "Malaria": [
        "fever", "chills", "sweating", "headache",
        "nausea", "vomiting", "muscle_pain",
        "fatigue", "high_temperature", "shivering"
    ],

    "Dengue Fever": [
        "high_fever", "severe_headache", "pain_behind_eyes",
        "joint_pain", "muscle_pain", "skin_rash",
        "mild_bleeding", "nausea", "fatigue", "vomiting"
    ],

    "Typhoid Fever": [
        "sustained_fever", "weakness", "stomach_pain",
        "headache", "loss_of_appetite", "diarrhea",
        "constipation", "skin_rash", "vomiting", "chills"
    ],

    "Cholera": [
        "watery_diarrhea", "vomiting", "muscle_cramps",
        "dehydration", "rapid_heartbeat", "dry_mouth",
        "sunken_eyes", "low_blood_pressure", "nausea"
    ],

    "Hepatitis B": [
        "jaundice", "fatigue", "abdominal_pain",
        "dark_urine", "nausea", "vomiting",
        "joint_pain", "loss_of_appetite", "fever", "pale_stool"
    ],

    "Hepatitis C": [
        "fatigue", "jaundice", "dark_urine",
        "abdominal_pain", "nausea", "loss_of_appetite",
        "joint_pain", "fever", "pale_stool", "itching"
    ],

    "HIV/AIDS": [
        "fever", "fatigue", "swollen_lymph_nodes",
        "night_sweats", "weight_loss", "skin_rash",
        "mouth_sores", "muscle_pain", "headache", "diarrhea"
    ],

    "Pneumonia": [
        "cough", "fever", "chills", "shortness_of_breath",
        "chest_pain", "fatigue", "nausea",
        "vomiting", "sweating", "rapid_breathing"
    ],

    "Influenza": [
        "fever", "chills", "muscle_aches", "headache",
        "fatigue", "dry_cough", "sore_throat",
        "runny_nose", "vomiting", "loss_of_appetite"
    ],

    "COVID-19": [
        "fever", "dry_cough", "fatigue", "loss_of_taste",
        "loss_of_smell", "shortness_of_breath",
        "body_aches", "headache", "sore_throat", "diarrhea"
    ],

    "Chickenpox": [
        "skin_rash", "itching", "fever", "fatigue",
        "loss_of_appetite", "headache", "blister_like_sores",
        "stomach_pain", "muscle_pain", "chills"
    ],

    # ─── CARDIOVASCULAR DISEASES ────────────────────────────

    "Cardiovascular Disease": [
        "chest_pain", "shortness_of_breath",
        "irregular_heartbeat", "fatigue", "dizziness",
        "swollen_legs", "rapid_heartbeat", "nausea",
        "sweating", "pain_in_arm"
    ],

    "Hypertension": [
        "headache", "dizziness", "blurred_vision",
        "chest_pain", "shortness_of_breath",
        "nosebleeds", "fatigue", "irregular_heartbeat",
        "pounding_in_chest", "vision_changes"
    ],

    "Stroke": [
        "sudden_numbness", "confusion", "trouble_speaking",
        "vision_problems", "severe_headache", "dizziness",
        "loss_of_balance", "facial_drooping",
        "arm_weakness", "slurred_speech"
    ],

    "Heart Failure": [
        "shortness_of_breath", "fatigue", "swollen_legs",
        "rapid_heartbeat", "persistent_cough",
        "wheezing", "reduced_exercise_ability",
        "nausea", "loss_of_appetite", "chest_pain"
    ],

    "Coronary Artery Disease": [
        "chest_pain", "shortness_of_breath", "fatigue",
        "heart_palpitations", "dizziness", "sweating",
        "nausea", "pain_in_arm", "indigestion", "weakness"
    ],

    "Cardiac Arrhythmia": [
        "irregular_heartbeat", "rapid_heartbeat",
        "slow_heartbeat", "chest_pain", "shortness_of_breath",
        "dizziness", "fainting", "fatigue",
        "sweating", "anxiety"
    ],

    # ─── METABOLIC & HORMONAL ───────────────────────────────

    "Diabetes Mellitus": [
        "frequent_urination", "excessive_thirst",
        "unexplained_weight_loss", "fatigue",
        "blurred_vision", "slow_healing_wounds",
        "frequent_infections", "tingling_hands_feet",
        "increased_hunger", "dry_mouth"
    ],

    "Obesity": [
        "excessive_weight", "shortness_of_breath",
        "excessive_sweating", "joint_pain", "fatigue",
        "sleep_problems", "back_pain", "low_confidence",
        "high_blood_pressure", "snoring"
    ],

    "Hypothyroidism": [
        "fatigue", "weight_gain", "cold_intolerance",
        "constipation", "dry_skin", "hair_loss",
        "slow_heartbeat", "depression", "muscle_weakness",
        "memory_problems"
    ],

    "Hyperthyroidism": [
        "weight_loss", "rapid_heartbeat", "sweating",
        "nervousness", "irritability", "tremors",
        "frequent_bowel_movements", "fatigue",
        "heat_intolerance", "bulging_eyes"
    ],

    "Metabolic Syndrome": [
        "excessive_weight", "high_blood_pressure",
        "high_blood_sugar", "fatigue", "frequent_urination",
        "excessive_thirst", "abdominal_obesity",
        "blurred_vision", "slow_healing_wounds"
    ],

    # ─── MENTAL HEALTH ──────────────────────────────────────

    "Depression": [
        "persistent_sadness", "loss_of_interest",
        "fatigue", "sleep_disturbance", "appetite_changes",
        "concentration_difficulty", "worthlessness",
        "social_withdrawal", "irritability", "hopelessness"
    ],

    "Anxiety Disorder": [
        "excessive_worry", "restlessness", "fatigue",
        "concentration_difficulty", "irritability",
        "sleep_disturbance", "muscle_tension",
        "rapid_heartbeat", "sweating", "trembling"
    ],

    "Schizophrenia": [
        "hallucinations", "delusions", "disorganized_speech",
        "social_withdrawal", "lack_of_motivation",
        "flat_affect", "concentration_difficulty",
        "memory_problems", "sleep_disturbance", "paranoia"
    ],

    "Bipolar Disorder": [
        "mood_swings", "mania", "depression",
        "sleep_disturbance", "irritability",
        "impulsive_behavior", "racing_thoughts",
        "grandiosity", "fatigue", "concentration_difficulty"
    ],

    "Post-Traumatic Stress Disorder": [
        "flashbacks", "nightmares", "severe_anxiety",
        "social_withdrawal", "sleep_disturbance",
        "irritability", "emotional_numbness",
        "concentration_difficulty", "hypervigilance", "depression"
    ],

    "Obsessive Compulsive Disorder": [
        "obsessive_thoughts", "compulsive_behaviors",
        "anxiety", "fear_of_contamination",
        "excessive_cleaning", "concentration_difficulty",
        "sleep_disturbance", "irritability",
        "social_withdrawal", "fatigue"
    ],

    "Insomnia": [
        "difficulty_falling_asleep", "waking_at_night",
        "waking_too_early", "fatigue", "irritability",
        "concentration_difficulty", "anxiety",
        "depression", "headache", "low_energy"
    ],

    # ─── RESPIRATORY ────────────────────────────────────────

    "Asthma": [
        "shortness_of_breath", "wheezing", "chest_tightness",
        "cough", "difficulty_breathing", "fatigue",
        "sleep_disturbance", "rapid_breathing",
        "whistling_sound_breathing", "anxiety"
    ],

    "Chronic Obstructive Pulmonary Disease": [
        "shortness_of_breath", "chronic_cough",
        "wheezing", "chest_tightness", "fatigue",
        "frequent_respiratory_infections", "cyanosis",
        "weight_loss", "swollen_ankles", "low_energy"
    ],

    "Bronchitis": [
        "persistent_cough", "mucus_production", "fatigue",
        "shortness_of_breath", "chest_discomfort",
        "low_fever", "chills", "sore_throat",
        "body_aches", "headache"
    ],

    "Pulmonary Embolism": [
        "shortness_of_breath", "chest_pain", "rapid_heartbeat",
        "cough", "blood_in_sputum", "dizziness",
        "fainting", "leg_swelling", "sweating", "fever"
    ],

    # ─── CANCER ─────────────────────────────────────────────

    "Lung Cancer": [
        "persistent_cough", "blood_in_sputum", "chest_pain",
        "shortness_of_breath", "weight_loss", "fatigue",
        "hoarseness", "loss_of_appetite",
        "recurring_pneumonia", "wheezing"
    ],

    "Breast Cancer": [
        "breast_lump", "breast_pain", "nipple_discharge",
        "skin_changes_breast", "swollen_lymph_nodes",
        "breast_shape_change", "fatigue", "weight_loss",
        "bone_pain", "shortness_of_breath"
    ],

    "Cervical Cancer": [
        "abnormal_vaginal_bleeding", "pelvic_pain",
        "pain_during_intercourse", "unusual_discharge",
        "fatigue", "weight_loss", "leg_pain",
        "swollen_legs", "back_pain", "loss_of_appetite"
    ],

    "Leukemia": [
        "fatigue", "fever", "frequent_infections",
        "easy_bruising", "weight_loss", "swollen_lymph_nodes",
        "bone_pain", "night_sweats", "pale_skin",
        "shortness_of_breath"
    ],

    "Skin Cancer": [
        "new_skin_growth", "change_in_mole", "skin_sore",
        "itching_skin_lesion", "bleeding_skin_lesion",
        "unusual_skin_patch", "skin_discoloration",
        "rough_scaly_patch", "pearly_bump", "dark_streak_nail"
    ],

    # ─── BONE & JOINT ───────────────────────────────────────

    "Arthritis": [
        "joint_pain", "joint_swelling", "joint_stiffness",
        "reduced_range_of_motion", "fatigue",
        "fever", "loss_of_appetite", "redness_joints",
        "warmth_around_joints", "morning_stiffness"
    ],

    "Osteoporosis": [
        "back_pain", "loss_of_height", "stooped_posture",
        "bone_fracture", "joint_pain", "muscle_weakness",
        "fatigue", "reduced_grip_strength",
        "brittle_nails", "tooth_loss"
    ],

    "Gout": [
        "severe_joint_pain", "joint_swelling", "redness_joints",
        "warmth_around_joints", "limited_range_of_motion",
        "fatigue", "fever", "kidney_stones",
        "tenderness", "peeling_skin"
    ],

    # ─── DIGESTIVE SYSTEM ───────────────────────────────────

    "Gastroenteritis": [
        "diarrhea", "vomiting", "nausea", "stomach_cramps",
        "fever", "headache", "muscle_aches",
        "loss_of_appetite", "dehydration", "fatigue"
    ],

    "Peptic Ulcer": [
        "burning_stomach_pain", "nausea", "vomiting",
        "bloating", "heartburn", "loss_of_appetite",
        "dark_stool", "weight_loss", "belching", "fatigue"
    ],

    "Irritable Bowel Syndrome": [
        "abdominal_pain", "bloating", "diarrhea",
        "constipation", "mucus_in_stool", "gas",
        "fatigue", "nausea", "urgent_bowel_movements",
        "feeling_of_incomplete_evacuation"
    ],

    "Liver Cirrhosis": [
        "fatigue", "jaundice", "abdominal_swelling",
        "easy_bruising", "loss_of_appetite", "nausea",
        "swollen_legs", "itching", "dark_urine", "confusion"
    ],

    # ─── SYMPTOMS / GENERAL ─────────────────────────────────

    "Fever": [
        "high_temperature", "chills", "sweating",
        "headache", "muscle_aches", "fatigue",
        "loss_of_appetite", "dehydration",
        "shivering", "weakness"
    ],

    "Headache": [
        "head_pain", "throbbing", "pressure_in_head",
        "nausea", "vomiting", "sensitivity_to_light",
        "sensitivity_to_sound", "blurred_vision",
        "dizziness", "neck_stiffness"
    ],

    "Anemia": [
        "fatigue", "weakness", "pale_skin",
        "shortness_of_breath", "dizziness", "headache",
        "cold_hands_feet", "irregular_heartbeat",
        "chest_pain", "cognitive_difficulties"
    ],

    "Malnutrition": [
        "weight_loss", "fatigue", "muscle_weakness",
        "dry_skin", "hair_loss", "slow_wound_healing",
        "frequent_infections", "poor_concentration",
        "depression", "swollen_abdomen"
    ],

    "Chronic Kidney Disease": [
        "fatigue", "swollen_ankles", "shortness_of_breath",
        "nausea", "frequent_urination", "blood_in_urine",
        "high_blood_pressure", "loss_of_appetite",
        "muscle_cramps", "itching"
    ],

}

# ─── AUTO GENERATE ALL UNIQUE SYMPTOMS ──────────────────────
ALL_SYMPTOMS = sorted(set(
    symptom
    for symptoms in DISEASE_SYMPTOMS.values()
    for symptom in symptoms
))

if __name__ == "__main__":
    print(f"✅ Total Diseases  : {len(DISEASE_SYMPTOMS)}")
    print(f"✅ Total Symptoms  : {len(ALL_SYMPTOMS)}")
    print(f"\n📋 All Diseases:")
    for i, disease in enumerate(DISEASE_SYMPTOMS.keys(), 1):
        print(f"  {i:02d}. {disease}")
    print(f"\n🩺 All Unique Symptoms:")
    for i, symptom in enumerate(ALL_SYMPTOMS, 1):
        print(f"  {i:02d}. {symptom}")
