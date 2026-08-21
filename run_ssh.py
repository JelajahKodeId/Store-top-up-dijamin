import pty, os, sys, time

pid, fd = pty.fork()
if pid == 0:
    os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", "root@103.160.212.12", "cd /var/www/store && git pull origin main && php artisan migrate --force")
else:
    output = b""
    try:
        while True:
            chunk = os.read(fd, 1024)
            if not chunk: break
            output += chunk
            if b"assword:" in chunk:
                os.write(fd, b"Rahasia321@\n")
            sys.stdout.write(chunk.decode("utf-8", errors="replace"))
            sys.stdout.flush()
    except OSError:
        pass

