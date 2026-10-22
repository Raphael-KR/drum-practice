"""Signal features only; tempo/phase choices and performance judgment stay outside."""
import subprocess
import numpy as np


def spectral_flux(audio, *, sample_rate, hop, nfft, bands):
    pcm = subprocess.run(['ffmpeg','-v','error','-i',str(audio),'-ac','1','-ar',str(sample_rate),
                          '-f','f32le','pipe:1'],capture_output=True,check=True).stdout
    wave=np.frombuffer(pcm,dtype='<f4')
    frames=np.lib.stride_tricks.sliding_window_view(wave,nfft)[::hop]
    spectrum=np.log1p(np.abs(np.fft.rfft(frames*np.hanning(nfft),axis=1)))
    flux=np.maximum(np.diff(spectrum,axis=0,prepend=spectrum[:1]),0)
    frequencies=np.fft.rfftfreq(nfft,1/sample_rate)
    times=(np.arange(len(frames))*hop+nfft/2)/sample_rate
    features=[]
    for lo,hi in bands:
        values=flux[:,(frequencies>=lo)&(frequencies<hi)].mean(axis=1)
        features.append(np.minimum(values/max(np.percentile(values,95),1e-8),4))
    return times,features,len(wave)/sample_rate
