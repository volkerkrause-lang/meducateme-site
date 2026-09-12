#!/usr/bin/env python3
import json, os, re, subprocess
from pathlib import Path
import torch, torchaudio
from chatterbox.tts import ChatterboxTTS

ROOT=Path(__file__).resolve().parents[1]
NARRATION=ROOT/'narration'/'intro.json'
OUT=ROOT/'audio'/'intro-chatterbox'
REFERENCE=ROOT/'narration'/'references'/'voice-reference.wav'
MAX_CHARS=int(os.environ.get('CHATTERBOX_MAX_CHARS','280'))
PAUSE_MS=int(os.environ.get('CHATTERBOX_PAUSE_MS','180'))
EXAGGERATION=float(os.environ.get('CHATTERBOX_EXAGGERATION','0.65'))
CFG_WEIGHT=float(os.environ.get('CHATTERBOX_CFG_WEIGHT','0.35'))

def split_script(text):
    sentences=re.split(r'(?<=[.!?])\s+',text.strip()); chunks=[]; current=''
    for sentence in sentences:
        if not sentence: continue
        pieces=re.split(r'(?<=[,;:])\s+',sentence) if len(sentence)>MAX_CHARS else [sentence]
        for piece in pieces:
            candidate=f'{current} {piece}'.strip()
            if current and len(candidate)>MAX_CHARS:
                chunks.append(current); current=piece
            else: current=candidate
    if current: chunks.append(current)
    return chunks

with NARRATION.open(encoding='utf-8') as f: data=json.load(f)
if not REFERENCE.exists(): raise SystemExit(f'Missing reference voice: {REFERENCE}')
OUT.mkdir(parents=True,exist_ok=True)
device='cuda' if torch.cuda.is_available() else 'cpu'
model=ChatterboxTTS.from_pretrained(device=device)
requested=os.environ.get('CHATTERBOX_STAGE','all').strip()
stages=data['stages'] if requested.lower()=='all' else [s for s in data['stages'] if s['id']==requested]
if not stages: raise SystemExit(f'Unknown stage: {requested}')
for stage in stages:
    rendered=[]
    chunks=split_script(stage['script'])
    for n,chunk in enumerate(chunks):
        wav=model.generate(chunk,audio_prompt_path=str(REFERENCE),exaggeration=EXAGGERATION,cfg_weight=CFG_WEIGHT).cpu()
        rendered.append(wav)
        if n<len(chunks)-1: rendered.append(torch.zeros((wav.shape[0],int(model.sr*PAUSE_MS/1000)),dtype=wav.dtype))
    combined=torch.cat(rendered,dim=-1)
    wav_path=OUT/f"{stage['id']}.wav"; mp3_path=OUT/f"{stage['id']}.mp3"
    torchaudio.save(str(wav_path),combined,model.sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav_path),'-codec:a','libmp3lame','-b:a','128k',str(mp3_path)],check=True)
    wav_path.unlink(missing_ok=True)
    print(f'Generated {mp3_path}')
