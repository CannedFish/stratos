package auth

import (
	"encoding/base64"
	"errors"
	"io/ioutil"
	"time"

	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/plugins/kubernetes/config"

	"github.com/labstack/echo"
)

const AuthConnectTypeKubeConfigAz = "kubeconfig-az"


// AzureKubeAuth is Azure Authentication with Certificates
type AzureKubeAuth struct {
	CertKubeAuth
}

// InitAzureKubeAuth creates a AzureKubeAuth
func InitAzureKubeAuth(portalProxy interfaces.PortalProxy) KubeAuthProvider {
	return &AzureKubeAuth{*InitCertKubeAuth(portalProxy)}
}

// GetName returns the provider name
func (c *AzureKubeAuth) GetName() string {
	return AuthConnectTypeKubeConfigAz
}

func (p *AzureKubeAuth) FetchToken(cnsiRecord interfaces.CNSIRecord, ec echo.Context) (*interfaces.TokenRecord, *interfaces.CNSIRecord, error) {
	req := ec.Request()

	// Need to extract the parameters from the request body
	defer req.Body.Close()
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return nil, nil, err
	}

	kubeConfig, err := config.ParseKubeConfig(body)

	kubeConfigUser, err := kubeConfig.GetUserForCluster(cnsiRecord.APIEndpoint.String())
	if err != nil {
		return nil, nil, errors.New("Unable to find cluster in kubeconfig")
	}

	authConfig, err := p.getAKSAuthConfig(kubeConfigUser)
	if err != nil {
		return nil, nil, errors.New("User doesn't use AKS auth")
	}

	jsonString, err := authConfig.GetJSON()
	if err != nil {
		return nil, nil, err
	}
	// Refresh token isn't required since the AccessToken will never expire
	refreshToken := jsonString

	accessToken := jsonString
	// Indefinite expiry
	expiry := time.Now().Local().Add(time.Hour * time.Duration(100000))

	tokenRecord := p.portalProxy.InitEndpointTokenRecord(expiry.Unix(), accessToken, refreshToken, false)
	tokenRecord.AuthType = AuthConnectTypeKubeConfigAz

	return &tokenRecord, &cnsiRecord, nil
}


func (p *AzureKubeAuth) getAKSAuthConfig(k *config.KubeConfigUser) (*KubeCertificate, error) {

	if !isAKSAuth(k) {
		return nil, errors.New("User doesn't use AKS")
	}

	cert, err := base64.StdEncoding.DecodeString(k.User.ClientCertificate)
	if err != nil {
		return nil, errors.New("Unable to decode certificate")
	}
	certKey, err := base64.StdEncoding.DecodeString(k.User.ClientKeyData)
	if err != nil {
		return nil, errors.New("Unable to decode certificate key")
	}
	kubeCertAuth := &KubeCertificate{
		Certificate:    string(cert),
		CertificateKey: string(certKey),
		Token:          k.User.Token,
	}
	return kubeCertAuth, nil
}

func isAKSAuth(k *config.KubeConfigUser) bool {
	if k.User.ClientCertificate == "" ||
		k.User.ClientKeyData == "" ||
		k.User.Token == "" {
		return false
	}
	return true
}
