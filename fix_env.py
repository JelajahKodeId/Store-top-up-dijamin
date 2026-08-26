import pty, os, sys
pid, fd = pty.fork()
if pid == 0:
    os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", "root@103.160.212.12", "cd /var/www/store && sed -i 's/GENSPAY_API_KEY=.*/GENSPAY_API_KEY=43d23e733feb7b4159f836fc16702f5f76b50a42725a11cf6f9190ca3e7b9a29/g' .env && php artisan config:clear")
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
