#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
أداة مساعدة لنشر تطبيق مولّد صفحات القصص على GitHub Pages

هذا السكريبت يقوم بالمهام التالية:
1. بناء التطبيق للإنتاج
2. إنشاء ملف .nojekyll لمنع GitHub من معالجة الموقع باستخدام Jekyll
3. نسخ ملف offline.html إلى مجلد dist للدعم في وضع عدم الاتصال
4. إنشاء ملف CNAME إذا كان لديك نطاق مخصص (اختياري)
5. تحضير الملفات للنشر على GitHub Pages
6. توفير تعليمات لتحويل التطبيق إلى APK باستخدام PWABuilder
"""

import os
import sys
import shutil
import re
import subprocess
import json
from pathlib import Path

# الألوان للطباعة الملونة
COLORS = {
    'HEADER': '\033[95m',
    'BLUE': '\033[94m',
    'GREEN': '\033[92m',
    'WARNING': '\033[93m',
    'FAIL': '\033[91m',
    'ENDC': '\033[0m',
    'BOLD': '\033[1m'
}

def print_colored(text, color):
    """طباعة نص ملون"""
    print(f"{COLORS[color]}{text}{COLORS['ENDC']}")

def run_command(command):
    """تنفيذ أمر وإرجاع النتيجة"""
    print_colored(f"تنفيذ: {command}", 'BLUE')
    try:
        result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print_colored(f"خطأ في تنفيذ الأمر: {e}", 'FAIL')
        print(e.stderr)
        return None

def build_project():
    """بناء المشروع للإنتاج"""
    print_colored("\n=== بناء المشروع للإنتاج ===", 'HEADER')
    
    # التحقق من وجود npm
    if shutil.which("npm") is None:
        print_colored("لم يتم العثور على npm. يرجى تثبيت Node.js وnpm أولاً.", 'FAIL')
        sys.exit(1)
    
    # تثبيت التبعيات
    print_colored("تثبيت التبعيات...", 'BLUE')
    run_command("npm install")
    
    # بناء المشروع
    print_colored("بناء المشروع...", 'BLUE')
    result = run_command("npm run build")
    
    if result is None:
        print_colored("فشل بناء المشروع.", 'FAIL')
        sys.exit(1)
    
    print_colored("تم بناء المشروع بنجاح!", 'GREEN')
    return True

def prepare_for_github_pages():
    """تحضير الملفات للنشر على GitHub Pages"""
    print_colored("\n=== تحضير الملفات للنشر على GitHub Pages ===", 'HEADER')
    
    # التحقق من وجود مجلد dist
    dist_dir = Path("dist")
    if not dist_dir.exists():
        print_colored("لم يتم العثور على مجلد dist. يرجى بناء المشروع أولاً.", 'FAIL')
        return False
    
    # إنشاء ملف .nojekyll
    nojekyll_file = dist_dir / ".nojekyll"
    nojekyll_file.touch()
    print_colored("تم إنشاء ملف .nojekyll", 'GREEN')
    
    # نسخ ملف offline.html إلى مجلد dist إذا لم يكن موجوداً بالفعل
    offline_src = Path("public/offline.html")
    offline_dest = dist_dir / "offline.html"
    if offline_src.exists() and not offline_dest.exists():
        shutil.copy(offline_src, offline_dest)
        print_colored("تم نسخ ملف offline.html إلى مجلد dist", 'GREEN')
    
    return True

def create_cname_file(domain=None):
    """إنشاء ملف CNAME إذا تم توفير نطاق مخصص"""
    if not domain:
        return
    
    print_colored("\n=== إنشاء ملف CNAME ===", 'HEADER')
    
    cname_file = Path("dist/CNAME")
    with open(cname_file, 'w') as f:
        f.write(domain)
    
    print_colored(f"تم إنشاء ملف CNAME مع النطاق: {domain}", 'GREEN')

def main():
    """الدالة الرئيسية"""
    print_colored("\n🚀 أداة مساعدة لنشر تطبيق مولّد صفحات القصص على GitHub Pages 🚀\n", 'BOLD')
    
    # بناء المشروع
    if not build_project():
        return
    
    # تحضير الملفات للنشر على GitHub Pages
    if not prepare_for_github_pages():
        return
    
    # سؤال المستخدم إذا كان لديه نطاق مخصص
    use_custom_domain = input("\nهل لديك نطاق مخصص لاستخدامه مع GitHub Pages؟ (نعم/لا): ").lower() in ['نعم', 'y', 'yes']
    
    if use_custom_domain:
        domain = input("أدخل النطاق المخصص (مثال: example.com): ").strip()
        if domain:
            create_cname_file(domain)
    
    print_colored("\n✅ تم الانتهاء من تحضير المشروع للنشر على GitHub Pages!", 'GREEN')
    print_colored("\nالخطوات التالية للنشر على GitHub Pages:", 'BOLD')
    print("1. قم برفع محتويات مجلد 'dist' إلى مستودع GitHub الخاص بك.")
    print("2. في إعدادات المستودع، قم بتمكين GitHub Pages واختر المجلد الرئيسي أو /docs كمصدر.")
    print("3. انتظر بضع دقائق حتى يتم نشر موقعك.")
    
    print_colored("\nتحويل التطبيق إلى تطبيق Android (APK):", 'BOLD')
    print("1. تأكد من أن التطبيق يعمل بشكل صحيح على GitHub Pages.")
    print("2. قم بزيارة موقع PWABuilder: https://www.pwabuilder.com")
    print("3. أدخل عنوان URL للتطبيق المنشور على GitHub Pages.")
    print("4. اتبع التعليمات لإنشاء حزمة APK.")
    print("5. قم بتنزيل ملف APK وتثبيته على جهاز Android.")
    
    print_colored("\nملاحظات هامة:", 'WARNING')
    print("- إذا كنت تستخدم فرعاً آخر غير 'main' أو 'master'، تأكد من تحديده في إعدادات GitHub Pages.")
    print("- تأكد من أن ملف manifest.json يحتوي على جميع المعلومات اللازمة لتحويل التطبيق إلى APK.")
    print("- تأكد من أن service-worker.js يعمل بشكل صحيح لدعم وضع عدم الاتصال.")
    print("- قد تحتاج إلى تعديل بعض الإعدادات في PWABuilder لتخصيص تطبيق Android الخاص بك.")

if __name__ == "__main__":
    main()