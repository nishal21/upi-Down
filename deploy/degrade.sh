#!/bin/sh
# Cron every minute. When the 1-min load stays above 1.5 (KVM 2 = 2 vCPU),
# UPI Down turns off live streaming so clients fall back to slow polling,
# leaving headroom for NMhelper. Clears itself when load drops.
# * * * * * /opt/upi-down/deploy/degrade.sh
LOAD=$(cut -d' ' -f1 /proc/loadavg)
R="docker exec upidown-redis-1 redis-cli"
if awk "BEGIN{exit !($LOAD > 1.5)}"; then
  $R SET degraded 1 EX 300 >/dev/null
elif awk "BEGIN{exit !($LOAD < 0.8)}"; then
  $R DEL degraded >/dev/null
fi
