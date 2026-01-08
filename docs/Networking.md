# 🚧 Cisco Switch/Router: Diagnose and Disable Port Security & ACLs (Organized Format)

---

## 🔍 STEP 1: Display Information (Check Before Changes)

### 🔹 1.1 Check VLANs
```bash
show vlan brief
show interfaces trunk
```

### 🔹 1.2 Check VTP Status
```bash
show vtp status
show vtp password
```

### 🔹 1.3 Check Port Security
```bash
show port-security
show port-security interface [interface_id]
```

### 🔹 1.4 Check ACLs and Their Application
```bash
show access-lists
show running-config | include access-group
show run interface [interface_id]
```

### 🔹 1.5 Check OSPF Configuration
```bash
show ip protocols
show ip ospf
show ip ospf neighbor
show ip ospf interface
show running-config | section router ospf
```

### 🔹 1.6 Check EIGRP Configuration
```bash
show ip protocols
show ip eigrp neighbors
show ip eigrp topology
show running-config | section router eigrp
```

---

## 🛠 STEP 2: Perform Corrective Actions

### 🔸 2.1 Disable Port Security (with `shutdown` / `no shutdown`)
```bash
configure terminal
interface range [range or interfaces with port security]
 shutdown
 no switchport port-security
 no switchport port-security maximum
 no switchport port-security violation
 no switchport port-security mac-address
 no switchport port-security aging
 no switchport port-security sticky
 no shutdown
exit
```

**Example:**
```bash
interface range FastEthernet0/1 - 24
 shutdown
 no switchport port-security
 no shutdown
```

> 🔁 Repeat for all interfaces shown in `show port-security`.

---

### 🔸 2.2 Unapply and Remove ACLs (with `shutdown` / `no shutdown` if needed)

#### 🔸 Unapply ACLs from Interfaces
```bash
interface [interface_id]
 shutdown
 no ip access-group [ACL# or name] [in|out]
 no shutdown
exit
```

**Example:**
```bash
interface GigabitEthernet0/2
 shutdown
 no ip access-group 101 in
 no shutdown
```

#### 🔸 Remove ACLs from Configuration
```bash
no access-list [number]
```

**Example:**
```bash
no access-list 101
```

Or for named ACLs:
```bash
no ip access-list extended [ACL_name]
```

**Example:**
```bash
no ip access-list extended BLOCK_TRAFFIC
```

---

## ✅ STEP 3: Verify Everything is Removed

### 🔹 Confirm Port Security is Disabled
```bash
show port-security
```

### 🔹 Confirm ACLs are Removed
```bash
show access-lists
show running-config | include access-group
```

### 🔹 Confirm Interface Status
```bash
show ip interface brief
```

### 🔹 Confirm No Errors or Shutdowns
```bash
show interfaces status
show logging
```

---

## 🧠 Optional: Auto-Recover From Port Security Errors
```bash
errdisable recovery cause psecure-violation
errdisable recovery interval 30
```

---

## 📌 Notes:
- Use `interface range` to speed up changes across many ports.
- Always check trunk ports — you don’t want to unintentionally kill uplinks.
- If using automation, verify each config line before applying changes.

