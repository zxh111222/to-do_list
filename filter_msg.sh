#!/bin/sh
sed -e 's/^功能[:：] /feat: /' \
    -e 's/^功能[:：]/feat: /' \
    -e 's/^配置[:：] /chore: /' \
    -e 's/^配置[:：]/chore: /' \
    -e 's/^构建[:：] /build: /' \
    -e 's/^构建[:：]/build: /' \
    -e 's/^修复[:：] /fix: /' \
    -e 's/^修复[:：]/fix: /' \
    -e 's/^优化[:：] /refactor: /' \
    -e 's/^优化[:：]/refactor: /' \
    -e 's/^清理/chore: 清理/' \
    -e 's/^新特性[:：] /feat: /' \
    -e 's/^新特性[:：]/feat: /' \
    -e 's/^design[:：] /style: /' \
    -e 's/^design[:：]/style: /'