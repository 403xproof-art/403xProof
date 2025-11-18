from setuptools import setup, find_packages

setup(
    name="x403auth-server-fastapi",
    version="1.0.0",
    description="FastAPI middleware for 403xAuth - stateless Web3 authentication",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="403xAuth Team",
    license="MIT",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.104.0",
        "solders>=0.18.0",
        "pynacl>=1.5.0",
    ],
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)

