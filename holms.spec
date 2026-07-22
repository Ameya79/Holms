import sys

block_cipher = None

a = Analysis(
    ["tray.py"],
    pathex=["."],
    binaries=[],
    datas=[
        ("backend/*.py", "backend"),
    ],
    hiddenimports=[
        "fastembed",
        "sqlite_vec",
        "PIL._tkinter_finder",
        "pystray._darwin",
        "pystray._win32",
        "pystray._xorg",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
    ],
    hookspath=[],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    name="Holms",
    debug=False,
    console=False,
    icon="assets/icon.ico" if sys.platform == "win32" else "assets/icon.icns",
)

if sys.platform == "darwin":
    app = BUNDLE(
        exe,
        name="Holms.app",
        icon="assets/icon.icns",
        bundle_identifier="com.holms.app",
        info_plist={
            "LSUIElement": True,
        },
    )
