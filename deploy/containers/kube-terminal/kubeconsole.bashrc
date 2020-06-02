
CYAN="\033[96m"
YELLOW="\033[93m"
GREEN="\033[92m"
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"

echo -e "${BOLD}${GREEN}SUSE Stratos Console${RESET}"
echo ""
echo -e "${CYAN}Kubernetes Terminal${RESET}"
echo ""

# Unpack helm comand
gunzip /stratos/helm.gz

# Need to choose appropriate kubectl version
pushd /stratos > /dev/null
# Default to the newwest version that we have
USE=$(ls kubectl_* | sort -r | head -n1)
popd > /dev/null

# If env var KUBERNETES_VERSION is set, then use it (major.minor only)
if [ -n "${KUBERNETES_VERSION}" ]; then
  VERSION="kubectl_${KUBERNETES_VERSION}.gz"
  if [ -f "/stratos/${VERSION}" ]; then
    USE=${VERSION}
  fi
fi

gunzip /stratos/${USE}
VER=${USE::-3}
mv /stratos/${VER} /stratos/kubectl
chmod +x /stratos/kubectl
export PATH=/stratos:$PATH

export KUBECONFIG=/root/.stratos/kubeconfig
export PS1="\033[92mstratos>\033[0m"
alias k=kubectl

# Helm shell completion
source <(helm completion bash)

#helm repo remove stable > /dev/null

if [ -f "/root/.stratos/helm-setup" ]; then
  echo "Setting up Helm repositories ..."
  source  "/root/.stratos/helm-setup" > /dev/null
  helm repo update 2>&1 > /dev/null
  echo ""
fi

if [ -f "/root/.stratos/history" ]; then
  cat /root/.stratos/history > /root/.bash_history
fi

# Make Bash append rather than overwrite the history on disk:
shopt -s histappend
# A new shell gets the history lines from all previous shells
PROMPT_COMMAND='history -a'
# Don't put duplicate lines in the history.
export HISTCONTROL=ignoredups

echo "Ready"
echo ""
