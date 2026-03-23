# Ansible Roles

## Role Structure
```
roles/nginx/
  tasks/main.yml       # Task list
  handlers/main.yml    # Handlers
  templates/nginx.conf.j2
  defaults/main.yml    # Default variables
  vars/main.yml        # Role variables
```

## Using Roles
```yaml
- hosts: webservers
  roles:
    - { role: nginx, nginx_port: 8080 }
    - { role: certbot, domain: myapp.com }
```

## Ansible Vault (secrets)
```bash
ansible-vault encrypt secrets.yml
ansible-vault edit secrets.yml
ansible-playbook --ask-vault-pass playbook.yml
```

## Galaxy: ansible-galaxy install geerlingguy.docker
