# Ansible

## Inventory (hosts.yml)
```yaml
all:
  children:
    webservers:
      hosts:
        web1: { ansible_host: 192.168.1.10 }
        web2: { ansible_host: 192.168.1.11 }
    dbservers:
      hosts:
        db1: { ansible_host: 192.168.1.20 }
```

## Playbook
```yaml
- hosts: webservers
  become: yes
  tasks:
    - name: Install nginx
      apt: name=nginx state=present
    - name: Copy config
      template: src=nginx.conf.j2 dest=/etc/nginx/nginx.conf
      notify: restart nginx
    - name: Enable service
      systemd: name=nginx state=started enabled=yes
  handlers:
    - name: restart nginx
      systemd: name=nginx state=restarted
```

## Run
```bash
ansible-playbook -i hosts.yml playbook.yml
ansible-playbook playbook.yml --check  # Dry run
ansible webservers -m ping             # Ad-hoc
```

## Roles for reusable modules, Vault for secrets, Galaxy for community roles
