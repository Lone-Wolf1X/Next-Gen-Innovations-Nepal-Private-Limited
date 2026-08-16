#!/usr/bin/expect -f
set timeout -1
spawn scp -o PreferredAuthentications=password -o PubkeyAuthentication=no "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/js/auth.js" "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/index.html" "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/categories.html" "/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/learn/course.html" root@161.118.189.212:/var/www/html/learn/
expect "*assword:"
send "Nepal@9876@@\r"
expect eof
