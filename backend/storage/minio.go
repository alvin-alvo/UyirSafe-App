package storage

import (
	"context"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func clientFromEnv() (*minio.Client, string, error) {
	// Default to the local pilot instance so uploads land in MinIO without
	// requiring env setup. Override with MINIO_ENDPOINT when MinIO lives
	// elsewhere (e.g. "minio:9000" inside docker networks).
	endpoint := os.Getenv("MINIO_ENDPOINT") // e.g. "localhost:9000"
	if endpoint == "" {
		endpoint = "localhost:9000"
	}
	access := os.Getenv("MINIO_ACCESS_KEY")
	if access == "" {
		access = "minioadmin"
	}
	secret := os.Getenv("MINIO_SECRET_KEY")
	if secret == "" {
		secret = "minioadmin"
	}
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	bucket := os.Getenv("MINIO_BUCKET")
	if bucket == "" {
		bucket = "uyir-reports"
	}
	cl, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access, secret, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, "", err
	}
	return cl, bucket, nil
}

// UploadImage uploads a local file to MinIO and returns the object key.
// Returns an error when MinIO is not configured/reachable — callers should
// fall back to local storage so the pilot still works on a single VM.
func UploadImage(ctx context.Context, localPath, objectName, contentType string) (string, error) {
	cl, bucket, err := clientFromEnv()
	if err != nil {
		return "", err
	}
	exists, err := cl.BucketExists(ctx, bucket)
	if err != nil {
		return "", err
	}
	if !exists {
		if err := cl.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			return "", err
		}
	}
	_, err = cl.FPutObject(ctx, bucket, objectName, localPath, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", err
	}
	return bucket + "/" + objectName, nil
}
